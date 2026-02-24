# Production Configuration Steps

## Vercel Environment Variables

You need to add the following environment variable to Vercel:

**Name:** `ADMIN_PASSWORD`  
**Value:** `s5g2sX7Qr3COci2ovxedpQ`

### How to add it:

1. Go to https://vercel.com/dashboard
2. Click on the `habitacionesmanizales` project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Fill in:
   - **Name:** `ADMIN_PASSWORD`
   - **Value:** `s5g2sX7Qr3COci2ovxedpQ`
   - **Environments:** Select `Production` (and `Preview` if you want)
6. Click **Save**
7. Vercel will redeploy automatically

### Access the Admin Panel

After the environment variable is configured:

- **Admin Login:** https://habitacionesmanizales.vercel.app/admin/login
- **Password:** `s5g2sX7Qr3COci2ovxedpQ`
- After login, you'll be redirected to the admin panel at `/admin`
- You can see a "Cerrar sesión" (Logout) button in the top right

## Testing the End-to-End Flow

1. **Create a test listing** (for now, use the backend API):
   ```bash
   curl -X POST https://habitacionesmanizales-production.up.railway.app/listings/ \
     -H "Content-Type: application/json" \
     -d '{
       "tipo": "Habitación",
       "title": "Test Listing from Admin",
       "description": "This is a test listing",
       "price": 500000,
       "neighborhood": "Centro",
       "features": ["Wifi", "Baño privado"],
       "image_urls": [],
       "contact_phone": "3001234567"
     }'
   ```

2. **Log into admin panel** at https://habitacionesmanizales.vercel.app/admin/login with password `s5g2sX7Qr3COci2ovxedpQ`

3. **See pending listing** in the admin panel

4. **Click "Publicar" button** to publish the listing

5. **Verify it appears** on the homepage at https://habitacionesmanizales.vercel.app/

6. **Click "Cerrar sesión"** to logout and confirm redirect to login page

## Security Notes

- The `ADMIN_PASSWORD` is stored as an environment variable in Vercel (secure)
- Session cookies are HTTP-only and use SameSite=strict protection
- The middleware redirects unauthenticated users to the login page
- The password is NOT visible to the frontend in the source code
- For even more security in the future, consider:
  - Implementing OAuth (Google, GitHub login)
  - Using a database for user credentials
  - Adding rate limiting to prevent brute force attacks
