# Estudia&Vive Manizales

Marketplace para conectar estudiantes universitarios en Manizales con arrendadores de habitaciones y apartaestudios.

## Estructura

```
habitacionesmanizales/
├── back/       # API REST con FastAPI + SQLite
└── front/      # Landing page con Next.js + Tailwind CSS
```

## Cómo ejecutar en desarrollo

### Backend
```bash
cd back
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Disponible en: http://127.0.0.1:8000

### Frontend
```bash
cd front
npm install
npm run dev
```
Disponible en: http://localhost:3000

### Túnel público (para pruebas con Tally)
```bash
npx localtunnel --port 8000
```

## Endpoints principales

| Método | Ruta                    | Descripción                                      |
|--------|-------------------------|--------------------------------------------------|
| GET    | `/listings/`            | Lista anuncios publicados                        |
| POST   | `/listings/`            | Crea anuncio directamente (uso interno/pruebas)  |
| POST   | `/api/webhooks/tally`   | Recibe formularios de Tally y crea anuncios      |

Los anuncios creados por webhook llegan con `is_published=False` para moderación manual.
