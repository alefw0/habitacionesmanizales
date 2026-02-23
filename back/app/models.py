"""
Modelo SQLAlchemy para anuncios de habitaciones y apartaestudios.
"""
import uuid
import secrets
import string
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, JSON, CHAR
from sqlalchemy.orm import Mapped

from .database import Base


def _generate_disable_token(length: int = 32) -> str:
    """Genera un string alfanumérico aleatorio único para disable_token."""
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


class Listing(Base):
    """Modelo de anuncio de habitación o apartaestudio en alquiler."""

    __tablename__ = "listings"

    id = Column(
        CHAR(36),
        primary_key=True,
        index=True,
        default=lambda: str(uuid.uuid4()),
    )
    tipo = Column(String(50), nullable=False, default="Habitación")  # "Habitación" | "Apartaestudio"
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Integer, nullable=False)
    neighborhood = Column(String(255), nullable=False)
    features = Column(JSON, nullable=False)  # array de strings (comodidades)
    image_urls = Column(JSON, nullable=False)  # lista de URLs de imágenes
    contact_phone = Column(String(50), nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    disable_token = Column(
        String(32),
        nullable=False,
        default=_generate_disable_token,
    )
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
