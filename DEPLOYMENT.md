# 🚀 Cooling Hub: Live Cloud Deployment Guide

This guide walks you through deploying the **Cooling Hub** system to the cloud for free:
- **Backend & Database:** Hosted on [Render](https://render.com) (FastAPI + PostgreSQL)
- **Frontend Website:** Hosted on [Vercel](https://vercel.com) (React 18 + Vite + Tailwind)

---

## Architecture Overview

```
┌───────────────────────────────────────┐
│           Vercel (Frontend)           │
│   https://cooling-hub.vercel.app      │
└──────────────────┬────────────────────┘
                   │ HTTPS API Requests (VITE_API_URL)
                   ▼
┌───────────────────────────────────────┐
│            Render (Backend)           │
│  https://cooling-hub-api.onrender.com │
└──────────────────┬────────────────────┘
                   │ PostgreSQL connection (DATABASE_URL)
                   ▼
┌───────────────────────────────────────┐
│       Render PostgreSQL Database      │
│          (Live Cloud Tables)          │
└───────────────────────────────────────┘
```

---

## Step 1: Push Local Changes to GitHub

Before creating services on Render and Vercel, ensure your latest code is pushed to your GitHub repository:

```bash
git add .
git commit -m "feat(deploy): configure Render PostgreSQL database and Vercel frontend"
git push origin main
```

---

## Step 2: Deploy Database & Backend on Render

### Option A: Using Render Blueprints (Recommended - 1 Click)
1. Log in to [Render.com](https://dashboard.render.com).
2. Click **New +** (top right) $\rightarrow$ select **Blueprint**.
3. Connect your GitHub repository (`cooling-hub`).
4. Render will automatically read `render.yaml` and configure:
   - **PostgreSQL Database:** `cooling-hub-db` (Free Tier)
   - **Web Service:** `cooling-hub-backend` (Python 3.11)
5. Click **Apply**.
6. Once deployed, copy your backend URL:  
   👉 `https://cooling-hub-backend.onrender.com`

---

### Option B: Manual Setup on Render Dashboard
If you prefer setting up step-by-step manually:

#### A. Create the PostgreSQL Database
1. Go to **Dashboard** $\rightarrow$ **New +** $\rightarrow$ **PostgreSQL**.
2. Name: `cooling-hub-db`
3. Database: `cooling_hub`
4. User: `cooling_user`
5. Region: Pick closest (e.g. *Singapore* or *Frankfurt*)
6. Instance Type: **Free**
7. Click **Create Database**.
8. Once created, scroll to **Connections** and copy the **Internal Database URL** (or External URL).

#### B. Create the Web Service (FastAPI)
1. Go to **Dashboard** $\rightarrow$ **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repo (`cooling-hub`).
3. Fill in the following details:
   - **Name:** `cooling-hub-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** **Free**
4. Scroll down to **Environment Variables**:
   - Add Key: `DATABASE_URL`
   - Value: *(Paste the PostgreSQL Connection URL from step A)*
   - Add Key: `PYTHON_VERSION`
   - Value: `3.11.8`
5. Click **Deploy Web Service**.
6. The service will build, start up, and automatically run `seed_database()` to populate all tables with initial data.
7. Copy your backend URL: `https://cooling-hub-backend.onrender.com`

---

## Step 3: Deploy Frontend on Vercel

1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository (`cooling-hub`).
4. In the **Configure Project** screen:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click *Edit* and select **`frontend`**
5. Expand **Environment Variables**:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://cooling-hub-backend.onrender.com` *(your Render backend URL from Step 2)*
6. Click **Deploy**.
7. In ~30 seconds, your site will be live at:  
   👉 `https://your-cooling-hub.vercel.app`

---

## Step 4: Verification & Testing

1. **Verify Backend Health & API Docs:**
   - Visit `https://cooling-hub-backend.onrender.com/` $\rightarrow$ should return `{"status": "online", "app": "Cooling Hub API Engine"}`.
   - Visit `https://cooling-hub-backend.onrender.com/docs` $\rightarrow$ Interactive Swagger UI for all 35+ endpoints.

2. **Verify Frontend Live Site:**
   - Open your Vercel URL.
   - Browse products in the Store.
   - Test the Live AC Smart Controller simulator.
   - Log in using test credentials:
     - **Customer:** `john@example.com` / `password123`
     - **Technician:** `tech@coolinghub.com` / `password123`
     - **Admin:** `admin@coolinghub.com` / `password123`

---

## Troubleshooting

- **Cold Starts on Render Free Tier:**  
  Render free web services spin down after 15 minutes of inactivity. The first request after idle may take 30–45 seconds to wake up.
- **CORS Issues:**  
  The backend already has `allow_origins=["*"]` configured in `app/main.py`, so cross-origin requests from your Vercel domain are permitted automatically.
- **Image Fallbacks:**  
  Realistic AC photos are bundled inside `frontend/public/images/products/` and are automatically served with zero latency by Vercel CDN.
