"""
Configuración de la base de datos con SQLAlchemy.
Soporta PostgreSQL en producción y SQLite en desarrollo local.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# En Railway u otros PaaS, la variable suele llamarse DATABASE_URL
# SQLAlchemy 1.4+ requiere 'postgresql://' en lugar de 'postgres://'
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./listings.db")
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Args solo necesarios para SQLite
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Generador de sesión de base de datos para inyección en FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
