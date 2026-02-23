"""
API REST FastAPI para gestión de habitaciones y apartaestudios en alquiler.
"""
import logging
import os
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Listing
from .schemas import ListingCreate, ListingResponse

# Carga variables del archivo .env (si existe) antes de leer ADMIN_TOKEN
load_dotenv()

# ---------------------------------------------------------------------------
# Admin token — leído desde variable de entorno (archivo .env o entorno real)
# ---------------------------------------------------------------------------
_ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")

logger = logging.getLogger(__name__)


def _require_admin(x_admin_token: str = Header(...)):
    """Dependencia que valida el token de administrador."""
    if not _ADMIN_TOKEN:
        raise HTTPException(status_code=500, detail="ADMIN_TOKEN no configurado en el servidor")
    if x_admin_token != _ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Token de administrador inválido")

# ---------------------------------------------------------------------------
# Mapeo de etiquetas del formulario Tally → campos del modelo Listing.
# Las claves deben coincidir exactamente con los labels de Tally (en minúscula).
# ---------------------------------------------------------------------------
TALLY_FIELD_MAP: dict[str, str] = {
    # tipo de alojamiento
    "tipo": "tipo",
    "tipo de alojamiento": "tipo",
    "tipo de propiedad": "tipo",
    # título
    "titulo": "title",
    "título": "title",
    "title": "title",
    "nombre del anuncio": "title",
    # descripción
    "descripcion": "description",
    "descripción": "description",
    "description": "description",
    "detalles": "description",
    # precio
    "precio": "price",
    "precio mensual": "price",
    "valor": "price",
    "price": "price",
    # barrio / sector
    "barrio": "neighborhood",
    "sector": "neighborhood",
    "neighborhood": "neighborhood",
    "ubicacion": "neighborhood",
    "ubicación": "neighborhood",
    # características / comodidades
    "caracteristicas": "features",
    "características": "features",
    "comodidades": "features",
    "servicios": "features",
    "features": "features",
    # fotos / imágenes
    "fotos": "image_urls",
    "imagenes": "image_urls",
    "imágenes": "image_urls",
    "fotos del lugar": "image_urls",
    "image_urls": "image_urls",
    # contacto
    "whatsapp": "contact_phone",
    "telefono": "contact_phone",
    "teléfono": "contact_phone",
    "celular": "contact_phone",
    "numero de whatsapp": "contact_phone",
    "número de whatsapp": "contact_phone",
    "contact_phone": "contact_phone",
}

# Valores válidos para el campo "tipo" — normaliza variantes del formulario
_TIPO_MAP: dict[str, str] = {
    "habitación": "Habitación",
    "habitacion": "Habitación",
    "cuarto": "Habitación",
    "pieza": "Habitación",
    "apartaestudio": "Apartaestudio",
    "apto estudio": "Apartaestudio",
    "estudio": "Apartaestudio",
}


def _extract_field_value(field: dict[str, Any]) -> Any:
    """
    Extrae el valor de un campo del payload Tally.
    - Campos de archivo: lista de dicts con 'url' → extrae solo las URLs.
    - CHECKBOXES / MULTIPLE_CHOICE: Tally envía UUIDs en 'value'; los resuelve
      a texto legible usando el array 'options' que acompaña al campo.
    - Texto / número: valor primitivo.
    """
    value = field.get("value")

    if isinstance(value, list):
        # Archivos: lista de objetos con clave 'url'
        if value and isinstance(value[0], dict) and "url" in value[0]:
            return [item["url"] for item in value if item.get("url")]

        # CHECKBOXES o MULTIPLE_CHOICE: los valores son UUIDs → resolver con 'options'
        field_type = field.get("type", "")
        if field_type in ("CHECKBOXES", "MULTIPLE_CHOICE"):
            options: list[dict] = field.get("options") or []
            id_to_text = {opt["id"]: opt["text"] for opt in options if "id" in opt and "text" in opt}
            resolved = [id_to_text.get(v, v) for v in value if v]
            return resolved

        return [str(v) for v in value if v]

    return value


def _parse_tally_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Convierte el payload crudo de Tally en un dict con los campos de Listing.

    Estructura esperada de Tally:
    {
      "data": {
        "fields": [
          {"label": "Título", "value": "Habitación céntrica"},
          ...
        ]
      }
    }
    También soporta el formato plano {"fields": [...]}.
    """
    fields: list[dict] = (
        payload.get("data", {}).get("fields", [])
        or payload.get("fields", [])
    )

    result: dict[str, Any] = {}

    for field in fields:
        label: str = str(field.get("label", "")).strip().lower()
        mapped_key = TALLY_FIELD_MAP.get(label)
        if mapped_key is None:
            continue

        value = _extract_field_value(field)
        if value is None or value == "" or value == []:
            continue

        result[mapped_key] = value

    # Normalizar campo "tipo" a los valores aceptados por el modelo
    if "tipo" in result:
        raw_tipo = str(result["tipo"]).strip().lower()
        # Si vino como lista (selección única a veces llega así en Tally)
        if isinstance(result["tipo"], list):
            raw_tipo = result["tipo"][0].strip().lower() if result["tipo"] else ""
        result["tipo"] = _TIPO_MAP.get(raw_tipo, "Habitación")

    return result


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Crea las tablas al iniciar la aplicación."""
    Base.metadata.create_all(bind=engine)
    yield


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Habitación Manizales API",
    description="API para gestionar anuncios de habitaciones y apartaestudios en alquiler",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/api/webhooks/tally", status_code=200)
async def receive_tally_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Recibe el payload de Tally.so, extrae los campos del formulario,
    valida con ListingCreate y persiste el anuncio con is_published=False
    para moderación manual antes de mostrarse en el sitio.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Payload JSON inválido")

    data = _parse_tally_payload(payload)

    if not data:
        logger.warning("Payload Tally sin campos reconocidos: %s", payload)
        return {"status": "ignored", "message": "No se reconocieron campos en el payload"}

    # Convertir precio a entero si viene como string ("600.000", "600000", etc.)
    if "price" in data:
        try:
            data["price"] = int(
                str(data["price"])
                .replace(".", "")
                .replace(",", "")
                .replace("$", "")
                .strip()
            )
        except (ValueError, TypeError):
            logger.error("Precio inválido desde Tally: %s", data.get("price"))
            return {"status": "error", "message": "Precio inválido, anuncio no guardado"}

    # Validar campos mínimos con Pydantic
    try:
        listing_in = ListingCreate(**data)
    except Exception as exc:
        logger.error("Validación fallida para payload Tally: %s | error: %s", data, exc)
        return {"status": "error", "message": f"Validación fallida: {exc}"}

    # Persistir con is_published=False para revisión manual
    listing = Listing(
        tipo=listing_in.tipo,
        title=listing_in.title,
        description=listing_in.description or "",
        price=listing_in.price,
        neighborhood=listing_in.neighborhood or "",
        features=listing_in.features or [],
        image_urls=listing_in.image_urls or [],
        contact_phone=listing_in.contact_phone or "",
        is_published=False,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    logger.info("Anuncio creado desde Tally id=%s, pendiente moderación", listing.id)
    return {
        "status": "success",
        "message": "Anuncio recibido y pendiente de moderación",
        "listing_id": str(listing.id),
    }


@app.post("/listings/", response_model=ListingResponse)
def create_listing(listing_in: ListingCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo anuncio directamente vía API (pruebas o uso interno).
    Se publica inmediatamente con is_published=True.
    """
    listing = Listing(
        tipo=listing_in.tipo,
        title=listing_in.title,
        description=listing_in.description or "",
        price=listing_in.price,
        neighborhood=listing_in.neighborhood or "",
        features=listing_in.features or [],
        image_urls=listing_in.image_urls or [],
        contact_phone=listing_in.contact_phone or "",
        is_published=True,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@app.get("/listings/", response_model=list[ListingResponse])
def list_listings(db: Session = Depends(get_db)):
    """
    Retorna la lista de anuncios publicados (is_published == True), ordenados por fecha.
    """
    return (
        db.query(Listing)
        .filter(Listing.is_published == True)
        .order_by(Listing.created_at.desc())
        .all()
    )


@app.get("/listings/{listing_id}", response_model=ListingResponse)
def get_listing(listing_id: str, db: Session = Depends(get_db)):
    """
    Retorna los detalles de un anuncio específico publicado.
    """
    listing = db.query(Listing).filter(Listing.id == listing_id, Listing.is_published == True).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado o no publicado")
    return listing


# ---------------------------------------------------------------------------
# Endpoints de administración (requieren header X-Admin-Token)
# ---------------------------------------------------------------------------

@app.get("/admin/listings/pending", response_model=list[ListingResponse])
def admin_list_pending(
    db: Session = Depends(get_db),
    _: None = Depends(_require_admin),
):
    """
    Lista todos los anuncios pendientes de moderación (is_published == False).
    """
    return (
        db.query(Listing)
        .filter(Listing.is_published == False)
        .order_by(Listing.created_at.desc())
        .all()
    )


@app.patch("/admin/listings/{listing_id}/publish", response_model=ListingResponse)
def admin_publish_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(_require_admin),
):
    """
    Publica un anuncio (is_published = True).
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    listing.is_published = True  # type: ignore
    db.commit()
    db.refresh(listing)
    logger.info("Anuncio publicado id=%s", listing_id)
    return listing


@app.patch("/admin/listings/{listing_id}/unpublish", response_model=ListingResponse)
def admin_unpublish_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(_require_admin),
):
    """
    Despublica un anuncio (is_published = False).
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    listing.is_published = False  # type: ignore
    db.commit()
    db.refresh(listing)
    logger.info("Anuncio despublicado id=%s", listing_id)
    return listing


@app.delete("/admin/listings/{listing_id}", status_code=200)
def admin_delete_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(_require_admin),
):
    """
    Elimina permanentemente un anuncio.
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    db.delete(listing)
    db.commit()
    logger.info("Anuncio eliminado id=%s", listing_id)
    return {"status": "deleted", "listing_id": listing_id}
