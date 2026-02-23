"""
Esquemas Pydantic para validación y serialización de la API.
"""
from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

TipoAlojamiento = Literal["Habitación", "Apartaestudio"]


class ListingCreate(BaseModel):
    """Campos para crear un anuncio. title y price son obligatorios; el resto opcionales."""

    model_config = ConfigDict(extra="ignore")

    tipo: TipoAlojamiento = "Habitación"
    title: str = Field(..., min_length=1, max_length=255)
    price: int = Field(..., gt=0)
    description: Optional[str] = None
    neighborhood: Optional[str] = None
    features: Optional[list[str]] = None
    image_urls: Optional[list[str]] = None
    contact_phone: Optional[str] = None


class ListingResponse(BaseModel):
    """Respuesta para el frontend: incluye id, tipo y created_at."""

    id: UUID
    tipo: str
    title: str
    description: str
    price: int
    neighborhood: str
    features: list[str]
    image_urls: list[str]
    contact_phone: str
    is_published: bool
    created_at: datetime

    model_config = {"from_attributes": True}
