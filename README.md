# LinkUp

LinkUp is a professional networking web app where users can create accounts, connect with others, share posts, and chat in real time.

## Tech stack

- **Frontend**: Next.js (React) + Material UI
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Real-time**: Socket.IO (chat/notifications)
- **Media storage**: Cloudinary (images/videos)

## Main features

- Register and login
- Profile info and profile photo
- Create posts (text + media)
- Follow/connect with other users
- Real-time messaging

## Deployment

- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Render](https://render.com)
- **Database** → [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

Full step-by-step guide: **[DEPLOYMENT.md](./DEPLOYMENT.md)**

## Project folders

- `frontend/` — Next.js website
- `backend/` — Express API + Socket.IO

## Run locally

```bash
# Backend (port 5000)
cd backend
npm install
npm run dev

# Frontend (port 3000)
cd frontend
npm install
npm run dev
```

Set env vars in `frontend/.env.local` and `backend/.env` (see `backend/.env.example`).
