## Backend (Railway + MongoDB Atlas)

The backend is in `backend/` and runs as an Express server on Railway.

### 1) MongoDB Atlas setup

- Create Atlas cluster
- Create a database user
- Allow network access (`0.0.0.0/0` for easiest setup)
- Copy SRV URI

### 2) Deploy backend to Railway

- Create a new Railway project and connect this repo
- `railway.json` is included and starts backend with:
  - `cd backend && npm start`

Set Railway environment variables:
- `MONGODB_URI` (required)
- `MONGODB_DB` (optional, default `caltrak`)
- `ADMIN_KEY` (required)
- `CORS_ORIGIN` (required, e.g. `https://your-frontend.vercel.app,http://localhost:5173`)

Health endpoint:
- `GET /health`

### 3) Frontend (Vercel) setup

In Vercel frontend env variables:
- `VITE_BACKEND_URL=https://<your-railway-service>.up.railway.app`
- `VITE_ADMIN_KEY=<same-admin-key>` (only if you use admin views from frontend)

### 4) Local development

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
npm install
npm run dev
```

Set local frontend env:
- `VITE_BACKEND_URL=http://localhost:3001`
