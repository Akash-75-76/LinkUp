# Deploy LinkUp on Render + Vercel

## Overview

| Part | Platform | Why |
|------|----------|-----|
| **Frontend** (Next.js) | **Vercel** | Built for Next.js, free HTTPS |
| **Backend** (Express + Socket.IO) | **Render** | Supports long-running Node servers and WebSockets |
| **Database** | **MongoDB Atlas** | Cloud MongoDB (free tier available) |
| **Media files** | **Cloudinary** | Profile photos, post images, chat images |

---

## Step 1: MongoDB Atlas

1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user and copy the connection string
3. In **Network Access**, allow `0.0.0.0/0` (or Render’s IPs) so the backend can connect

---

## Step 2: Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy from your dashboard:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

---

## Step 3: Deploy backend on Render

1. Push your code to **GitHub**
2. Go to [render.com](https://render.com) → **New +** → **Web Service**
3. Connect your repo and set:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run prod`
4. Add **Environment Variables**:

| Variable | Example |
|----------|---------|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/linkup` |
| `JWT_SECRET` | any long random string |
| `NODE_ENV` | `production` |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | from Cloudinary |
| `FRONTEND_URL` | your Vercel URL (add after Step 4) |

5. Click **Create Web Service**
6. Copy your Render URL, e.g. `https://linkup-backend.onrender.com`

**Test:** open `https://your-backend.onrender.com/` — you should see a JSON “Server is running” message.

---

## Step 4: Deploy frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import the same GitHub repo
3. Set:
   - **Framework**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
4. Add **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://your-backend.onrender.com` |

5. Deploy and copy your Vercel URL, e.g. `https://linkup.vercel.app`

---

## Step 5: Connect frontend and backend

1. In **Render**, set `FRONTEND_URL` to your Vercel URL
2. **Redeploy** both services after changing env vars

---

## Local development

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

**`backend/.env`** — copy from `backend/.env.example`

Run:
```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

---

## Important notes

- API routes use **`/api`**, e.g. register is `POST /api/users/register`
- Frontend and backend must both use **HTTPS** in production
- Render **free tier** sleeps after ~15 min idle — first request may be slow
- Media uploads go to **Cloudinary**, not the server disk (except PDF exports)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Mixed Content error | Use `https://` URLs in Vercel env vars, not `http://` IP |
| Route not found | Use `/api/users/...`, not `/users/...` |
| CORS error | Set `FRONTEND_URL` on Render to your exact Vercel URL |
| MongoDB fails | Check Atlas IP whitelist and connection string |
| Socket not connecting | Set `NEXT_PUBLIC_SOCKET_URL` to Render backend URL (no `/api`) |
