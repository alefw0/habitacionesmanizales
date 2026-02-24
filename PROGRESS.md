# Estudia&Vive Manizales — Progress Tracker

**Last Updated:** 2026-02-23
**Status:** ✅ Admin dashboard with tabs completed

---

## 🎯 Current Goal

Build a complete student housing marketplace with automated moderation:
- ✅ Frontend in Vercel (Next.js) with Tally form integration
- ✅ Backend in Railway (FastAPI) with webhook receiver
- ✅ Admin panel with authentication + moderation (publish/reject/delete)

---

## ✅ Completed Features

### Backend (FastAPI / Railway)
- [x] Webhook receiver for Tally submissions (`POST /api/webhooks/tally`)
- [x] Listings saved with `is_published=False` (pending moderation)
- [x] Admin endpoints:
  - `GET /admin/listings/pending` - list pending anuncios
  - `GET /admin/listings/all` - list all anuncios (published + pending)
  - `PATCH /admin/listings/{id}/publish` - publish anuncio
  - `PATCH /admin/listings/{id}/unpublish` - unpublish anuncio
  - `DELETE /admin/listings/{id}` - delete anuncio
- [x] Admin token authentication via `X-Admin-Token` header
- [x] UUID resolution for Tally checkboxes/multi-select fields

### Frontend (Next.js / Vercel)
- [x] Home page with published listings
- [x] "Publicar Habitación" button opens Tally form
- [x] Admin login page (`/admin/login`)
- [x] Admin dashboard (`/admin/dashboard`) with:
  - [x] "Pendientes" tab - list anuncios awaiting approval
  - [x] "Todos" tab - list all anuncios (published + pending)
  - [x] Status badges (Publicado/Pendiente)
  - [x] Publish button (Pendientes & Todos tabs)
  - [x] Reject/Despublicar button (context-aware)
  - [x] Delete button (Todos tab only)
- [x] Next.js rewrites for `/admin-api/*` → backend `/admin/*`

### Deployment
- [x] Vercel → frontend autodetects monorepo
- [x] Railway → backend deployed
- [x] Environment variables configured in Vercel
- [x] Build passes successfully

---

## 🔄 In Progress / Urgent

1. **Update Tally webhook URL to production:**
   - Change from local `cloudflared` to production Railway URL
   - URL should be: `https://habitacionesmanizales-production.up.railway.app/api/webhooks/tally`

2. **Test end-to-end flow in production:**
   - Submit test anuncio via Tally (production form)
   - Verify it appears in admin dashboard
   - Test publish/delete flow

---

## 📁 Key Files

```
/back/
├── app/main.py                    ✅ All admin endpoints + UUID resolution
├── .env                           ✅ ADMIN_TOKEN configured
└── requirements.txt               ✅ python-dotenv added

/front/
├── next.config.ts                 ✅ Rewrites for /admin-api/*
├── app/
│   ├── page.tsx                   ✅ Home page with Tally button
│   ├── admin/
│   │   ├── page.tsx               ✅ Login page
│   │   └── dashboard/page.tsx      ✅ JUST UPDATED: Added tabs, status badges, delete button
│   └── api/admin/auth/login       ✅ Login endpoint
└── .env.local                     ✅ NEXT_PUBLIC_ADMIN_TOKEN

/
├── PROGRESS.md                    📝 This file (new)
└── .gitignore                     ✅ .env + .env.local ignored
```

---

## 🚀 Next Steps

1. **Production Testing**
   - [ ] Update Tally webhook to: `https://habitacionesmanizales-production.up.railway.app/api/webhooks/tally`
   - [ ] Submit test anuncio on Tally
   - [ ] Verify appears in admin dashboard at `/admin/dashboard`
   - [ ] Test publish → verify appears on home page
   - [ ] Test delete → verify removed from both tabs

2. **Optional Enhancements**
   - [ ] Add search/filter in admin dashboard
   - [ ] Add image preview modal
   - [ ] Add bulk operations (publish multiple at once)
   - [ ] Add export/analytics
   - [ ] Add contact form notifications

---

## 🔐 Security Notes

- `NEXT_PUBLIC_ADMIN_TOKEN` is visible in browser (OK for internal use, consider API route for production public deployment)
- Admin endpoints require header authentication
- Session stored in cookie (basic, sufficient for internal admin)

---

## 📊 Database Schema (Listing)

```python
id: UUID
tipo: "Habitación" | "Apartaestudio"
title: str
description: str
price: int
neighborhood: str
features: list[str]
image_urls: list[str]
contact_phone: str
is_published: bool
created_at: datetime
```

---

## 🔗 Useful Commands

### Local Development
```bash
# Backend
cd back && source venv/bin/activate && uvicorn app.main:app --reload

# Frontend
cd front && npm run dev

# Expose tunnel (if needed for local testing)
npx cloudflared tunnel --url http://localhost:8000
```

### Admin Panel
- URL: `http://localhost:3000/admin`
- Login: username=`admin`, password=`admin123`
- Or production: `https://estudia-vive-manizales.vercel.app/admin`

---

## 📝 Changelog

### 2026-02-23
- ✅ Added tabs ("Pendientes" | "Todos") in admin dashboard
- ✅ Display all listings with status badges (Publicado/Pendiente)
- ✅ Add delete button visible only in "Todos" tab
- ✅ Backend endpoint `GET /admin/listings/all` for listing all anuncios

