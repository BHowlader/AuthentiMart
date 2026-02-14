# AuthentiMart Deployment Guide

Deploy AuthentiMart with:
- **Frontend**: Vercel (authentimart.com)
- **Backend**: Render (api.authentimart.com)
- **Database**: Supabase (PostgreSQL)

---

## 1. Supabase Setup (Database)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **New Project**
3. Enter details:
   - **Name**: `authentimart`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: `Singapore` (closest to Bangladesh)
4. Wait for project creation

### Step 2: Get Connection String
1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string**
3. Copy the **URI** (use Session mode for Render):
   ```
   postgresql://postgres.[ref]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```

---

## 2. Render Setup (Backend)

### Step 1: Create Service
1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your GitHub repo

### Step 2: Configure
| Setting | Value |
|---------|-------|
| Name | `authentimart-api` |
| Region | `Singapore` |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | `Free` |

### Step 3: Environment Variables
Add these in **Environment** tab:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `SECRET_KEY` | Run: `openssl rand -hex 32` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` |
| `APP_NAME` | `AuthentiMart` |
| `APP_URL` | `https://authentimart.com` |
| `DEBUG` | `False` |

Add payment/courier keys as needed (bKash, Pathao, Steadfast).

### Step 4: Deploy
Click **Create Web Service**. Your API will be at:
`https://authentimart-api.onrender.com`

---

## 3. Vercel Setup (Frontend)

### Step 1: Import Project
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New** → **Project**
3. Import your repo

### Step 2: Configure
| Setting | Value |
|---------|-------|
| Framework | `Vite` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Step 3: Environment Variables
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://authentimart-api.onrender.com/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth ID |
| `VITE_FACEBOOK_APP_ID` | Your Facebook App ID |

### Step 4: Deploy
Click **Deploy**. Your frontend will be at a Vercel URL.

### Step 5: Custom Domain
1. Go to **Settings** → **Domains**
2. Add `authentimart.com`

---

## 4. DNS Configuration

At your domain registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

---

## 5. Post-Deployment Checklist

- [ ] Frontend: `https://authentimart.com`
- [ ] API Health: `https://authentimart-api.onrender.com/health`
- [ ] API Docs: `https://authentimart-api.onrender.com/docs`
- [ ] Test login/registration
- [ ] Test product listing
- [ ] Test checkout flow

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | Free |
| Render | Free | Free |
| Supabase | Free | Free |
| **Total** | | **$0/month** |

**Note:** Render free tier sleeps after 15 mins of inactivity. First request after sleep takes ~30 seconds.
