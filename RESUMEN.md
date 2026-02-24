# Resumen del Proyecto: Estudia&Vive Manizales

## 📋 Visión General

Crear una plataforma web para conectar estudiantes con habitaciones y apartaestudios en alquiler en Manizales, Colombia. Los arrendadores publican ofertas a través de un formulario Tally, que se envía al backend vía webhook, y un panel de admin revisa y publica los anuncios.

**Stack:**
- **Frontend:** Next.js 16.1.6 + TypeScript + Tailwind CSS (Vercel)
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL (Railway)
- **Formularios:** Tally.so
- **Hosting:** Vercel (frontend) + Railway (backend)

---

## 🎯 Objetivos Completados

### **Sesión 1-2: Setup Inicial**
- ✅ Repositorio GitHub creado e inicializado
- ✅ Proyecto deployado en Vercel (frontend) y Railway (backend)
- ✅ Base de datos PostgreSQL en Railway configurada
- ✅ Estructura monorepo: `/front` y `/back`

### **Sesión 3: Sistema de Autenticación**
- ✅ Página de login (`/login`) creada con autenticación
- ✅ Panel de admin (`/admin`) protegido con middleware
- ✅ Rutas dinámicas configuradas en Next.js
- ❌ Problema: `/login` retorna 404 en Vercel (aún sin resolver)
  - Funciona localmente pero falla en producción
  - Deferred para enfocarse en otras prioridades

### **Sesión 4: Listados Públicos**
- ✅ API de backend para obtener listings publicados
- ✅ Página de inicio con galería de alojamientos
- ✅ Sistema de filtros: búsqueda, tipo (Habitación/Apartaestudio), precio máximo
- ✅ Componente `ListingCard` con detalles del alojamiento
- ✅ Botón "Contactar por WhatsApp" integrado
- ✅ Responsive design (mobile, tablet, desktop)

### **Sesión 5: Integración con Tally (HOY)**
- ✅ Botón "Publicar Habitación" conectado a formulario Tally
- ✅ URL del formulario: `https://tally.so/r/MebgPM`
- ✅ Webhook configurado en Tally → `https://habitacionesmanizales-production.up.railway.app/api/webhooks/tally`
- ✅ Backend recibe y guarda datos de Tally en PostgreSQL
- ✅ Corrección de sintaxis en `next.config.ts`
- 🔄 **En progreso:** Redirección post-formulario y publicación automática

---

## 📂 Estructura del Proyecto

```
habitacionesmanizales/
├── front/                          # Next.js 16 Frontend
│   ├── app/
│   │   ├── page.tsx               # Página de inicio (listados + filtros)
│   │   ├── layout.tsx             # Layout raíz
│   │   ├── login/page.tsx         # Página de login (⚠️ 404 en Vercel)
│   │   ├── admin/page.tsx         # Panel de admin (protegido)
│   │   └── alojamiento/[id]/page.tsx  # Detalle de alojamiento
│   ├── components/
│   │   └── ListingCard.tsx        # Tarjeta de alojamiento
│   ├── types/index.ts             # TypeScript types
│   ├── middleware.ts              # Protección de rutas
│   ├── next.config.ts             # Configuración (rewrites al backend)
│   ├── .env.local                 # Variables de entorno (no tracked)
│   └── package.json
│
├── back/                           # FastAPI Backend
│   ├── app/
│   │   ├── main.py                # API endpoints + webhook Tally
│   │   ├── models.py              # Modelos SQLAlchemy
│   │   ├── schemas.py             # Schemas Pydantic
│   │   └── database.py            # Conexión PostgreSQL
│   ├── requirements.txt            # Dependencias Python
│   ├── .env                        # Variables de entorno (no tracked)
│   └── railway.toml               # Configuración Railway
│
├── .gitignore                      # Archivos ignorados por git
├── README.md                       # Documentación
├── RESUMEN.md                      # Este archivo
├── vercel.json                     # Configuración Vercel
└── AGENTS.md                       # Notas de desarrollo
```

---

## 🔧 Características Implementadas

### **Frontend**

#### Página de Inicio (`/`)
- **Hero section** con descripción del servicio
- **Barra de filtros:**
  - 🔍 Búsqueda por título o barrio
  - 🏠 Filtro por tipo (Habitación/Apartaestudio)
  - 💰 Filtro por precio máximo
- **Galería de alojamientos** en grid responsivo (1-3 columnas)
- **ListingCard** con:
  - Imagen del alojamiento
  - Badge de tipo (azul/púrpura)
  - Título, barrio, precio
  - Características (hasta 3)
  - Botón WhatsApp directo

#### Botón "Publicar Habitación"
- Ubicado en navbar sticky
- Navega a formulario Tally: `https://tally.so/r/MebgPM`
- ✅ Funciona en localhost
- ✅ Funciona en Vercel

### **Backend**

#### API Endpoints
- `GET /listings/` - Retorna alojamientos publicados (is_published=true)
- `POST /api/webhooks/tally` - Recibe envíos del formulario Tally
- `PATCH /admin/listings/{id}/publish` - Publica un alojamiento (requiere token)
- `PATCH /admin/listings/{id}/unpublish` - Despublica un alojamiento
- `DELETE /admin/listings/{id}` - Elimina un alojamiento
- `GET /admin/listings/pending` - Lista anuncios pendientes

#### Procesamiento de Tally
- Recibe webhook JSON de Tally
- Mapea campos del formulario a campos del modelo Listing
- Resuelve UUIDs de checkboxes a texto legible
- Valida datos con Pydantic
- Guarda en PostgreSQL con `is_published=False` (pendiente moderación)

### **Base de Datos**

#### Modelo Listing
```python
- id: UUID (primary key)
- tipo: "Habitación" | "Apartaestudio"
- title: string
- description: string
- price: integer (COP)
- neighborhood: string
- features: list[string]
- image_urls: list[string]
- contact_phone: string
- is_published: boolean
- created_at: datetime
```

---

## 📊 Flujo de Datos

```
1. Usuario hace click en "Publicar Habitación"
   ↓
2. Navega a formulario Tally
   ↓
3. Arrendador llena datos (tipo, título, precio, fotos, etc.)
   ↓
4. Tally envía webhook a backend
   ↓
5. Backend recibe y valida datos
   ↓
6. Listing se guarda en PostgreSQL con is_published=false
   ↓
7. Admin revisa en panel /admin
   ↓
8. Admin hace click en "Publicar"
   ↓
9. Listing aparece en página de inicio para estudiantes
```

---

## ⚙️ Configuración Actual

### **Variables de Entorno**

**Frontend (.env.local):**
```
NEXT_PUBLIC_ADMIN_TOKEN=eddc12d581e004a3ba5972e84ce3410ed65adcd4dfb15e7272a3d3c4d608a407
```

**Backend (.env):**
```
ADMIN_TOKEN=eddc12d581e004a3ba5972e84ce3410ed65adcd4dfb15e7272a3d3c4d608a407
DATABASE_URL=postgresql://...@...railway.app/...
```

### **URLs**

- **Frontend (Vercel):** https://habitacionesmanizales.vercel.app/
- **Backend (Railway):** https://habitacionesmanizales-production.up.railway.app/
- **Admin Panel:** https://habitacionesmanizales.vercel.app/admin
- **Formulario Tally:** https://tally.so/r/MebgPM

### **Webhook Tally**
- **URL:** https://habitacionesmanizales-production.up.railway.app/api/webhooks/tally
- **Método:** POST
- **Redirección post-envío:** ❌ **PENDIENTE CONFIGURAR** → https://habitacionesmanizales.vercel.app/

---

## 🚨 Problemas Conocidos

### **1. `/login` retorna 404 en Vercel** (⚠️ Deferred)
- **Estado:** Abierto desde sesión 3
- **Síntoma:** Página funciona en `localhost:3000/login` pero 404 en `vercel.app/login`
- **Causa probable:** Bug de Next.js 16/Turbopack con rutas dinámicas o edge runtime en Vercel
- **Intentos de fix:** Mover ruta de `/admin/login` a `/login` (no funcionó)
- **Decisión:** Pospuesto - no afecta flujo principal de publicación

### **2. Listings no aparecen publicados** (🔄 HOY)
- **Síntoma:** Formulario Tally se envía, pero listing no aparece en página inicial
- **Causa probable:** 
  - Listings se guardan con `is_published=false` (por diseño)
  - No hay redirección post-formulario configurada en Tally
  - Admin no ha publicado manualmente los listings
- **Solución pendiente:** 
  - Configurar redirección en Tally
  - Verificar que listings están en BD
  - Publicar manualmente o configurar publicación automática

---

## 📝 Commits Recientes

```
1466053 feat: connect 'Publicar Habitación' button to Tally form
9bd9163 fix: add /admin-api rewrite for admin panel endpoints
8042f04 fix: move login page to root level /login to bypass Next.js 16 nested route 404 bug
9fcf80d fix: update middleware matcher to exclude /admin/login from protection
53d1d3b chore: restore middleware for admin route protection
```

---

## 🎯 Próximos Pasos

1. ✅ **Configurar redirección en Tally** → Redirigir a homepage post-envío
2. 📋 **Verificar listings en BD** → Confirmar que Tally envía datos correctamente
3. 🔓 **Publicar listings manualmente** → Usar panel admin para aprobar
4. 🤖 **Opcional:** Configurar publicación automática (sin moderación)
5. 🧪 **Testing end-to-end** → Llenar formulario Tally completo y verificar flujo
6. 🐛 **(Eventual)** Resolver problema de `/login` en Vercel

---

## 👤 Tecnologías & Tools

- **Frontend:** Next.js, TypeScript, Tailwind CSS, React
- **Backend:** FastAPI, SQLAlchemy, Pydantic
- **Database:** PostgreSQL (Railway)
- **Hosting:** Vercel, Railway
- **Forms:** Tally.so
- **Version Control:** Git, GitHub
- **Development:** VS Code, npm, pip

---

**Última actualización:** 23 Feb 2026, 20:51 UTC
