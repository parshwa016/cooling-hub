# 🚀 AWS Amplify Deployment Guide for Cooling Hub

This guide shows you how to deploy the **Cooling Hub** website on **AWS Amplify Hosting** with global CloudFront CDN performance, automatic SSL, and continuous deployment from GitHub.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│           AWS Amplify (Frontend)             │
│    https://main.dxxxxxxxx.amplifyapp.com     │
└──────────────────────┬───────────────────────┘
                       │ HTTPS API Requests (VITE_API_URL)
                       ▼
┌──────────────────────────────────────────────┐
│            Render (FastAPI Backend)          │
│       https://cooling-hub.onrender.com       │
└──────────────────────┬───────────────────────┘
                       │ PostgreSQL Connection
                       ▼
┌──────────────────────────────────────────────┐
│          Render PostgreSQL Database          │
└──────────────────────────────────────────────┘
```

---

## Step 1: Open AWS Amplify Console

1. Log in to your AWS account at **[https://console.aws.amazon.com/amplify/](https://console.aws.amazon.com/amplify/)**.
2. Make sure you are in your preferred region (e.g., **ap-south-1 Mumbai** or **us-east-1**).
3. Click the orange button: **Deploy an app** (or **Host web app**).

---

## Step 2: Connect GitHub Repository

1. Under *Start deployment with existing code*, choose **GitHub** $\rightarrow$ click **Next**.
2. Authorize AWS to access your GitHub account.
3. Select your repository:
   - **Repository:** `parshwa016/cooling-hub`
   - **Branch:** `main`
4. If asked for *Monorepo / App root*:
   - Check **Connecting a monorepo?**
   - Type `frontend` as the **App root** (or leave default, as our root `amplify.yml` handles `cd frontend`).
5. Click **Next**.

---

## Step 3: Configure Build & Environment Variables

AWS Amplify will automatically detect the build settings from the [`amplify.yml`](file:///C:/Users/Dell/.gemini/antigravity/scratch/cooling_hub/amplify.yml) file we added to your repo!

### Add Environment Variables:
Expand **Advanced settings** $\rightarrow$ **Environment variables** $\rightarrow$ click **Add variable**:

| Key | Value | Description |
| :--- | :--- | :--- |
| **`VITE_API_URL`** | `https://cooling-hub.onrender.com` | Live FastAPI Backend on Render |

*(Optional: If using Firebase Google Auth in production, you can also add `VITE_FIREBASE_API_KEY`, etc.).*

Click **Next**.

---

## Step 4: Review and Deploy

1. Review your settings and click **Save and deploy**.
2. AWS Amplify will execute 4 stages:
   - **Provision:** Spins up build container.
   - **Build:** Runs `npm ci` and `npm run build`.
   - **Deploy:** Uploads static assets to Amazon CloudFront.
   - **Verify:** Checks SSL certificate and health.
3. Once finished, click on the generated domain (e.g. `https://main.dxxxxxxxx.amplifyapp.com`).

---

## Step 5: Configure SPA Rewrites (Crucial for React Routing)

To ensure that refreshing pages like `/shop`, `/services`, or `/admin` doesn't throw a 404:

1. In the AWS Amplify Console left sidebar, click **Rewrites and redirects**.
2. Click **Edit**.
3. Ensure there is a rule with:
   - **Source address:** `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   - **Target address:** `/index.html`
   - **Type:** `200 (Rewrite)`
4. Click **Save**.

Your Cooling Hub frontend is now live on AWS Amplify!
