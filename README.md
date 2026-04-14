## Backend (Railway alternative)

Railway can go down; this repo includes a ready-to-deploy **Render** setup for the MongoDB backend.

### Option A: Render + MongoDB Atlas (recommended)

- **Backend service**: Render (Docker deploy)
- **Database**: MongoDB Atlas (free tier)

#### 1) Create MongoDB Atlas DB
- Create a cluster and get your connection string (SRV).
- Put it in `MONGODB_URI`.

#### 2) Deploy backend to Render
- Connect this repo in Render
- Render will detect `render.yaml` and create `caltrak-backend`
- Set env vars in Render:
  - `MONGODB_URI`: your Atlas connection string
  - `ADMIN_KEY`: any secret string you choose
  - `CORS_ORIGIN`: comma-separated origins (your frontend URL + local dev)

Your backend health endpoint will be:
- `GET /health`

#### 3) Point the frontend at the new backend

Set `VITE_BACKEND_URL` in your frontend environment (Vercel/Netlify/etc).

Example:
- `VITE_BACKEND_URL=https://<your-render-service>.onrender.com`

Notes:
- In **dev**, if `VITE_BACKEND_URL` is not set, the app defaults to `http://localhost:3001`.
- In **prod**, if `VITE_BACKEND_URL` is not set, backend calls are disabled (no hardcoded Railway URL).
