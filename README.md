<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# VitalEats (Frontend + Backend)

This repo is split into two independent apps:
- `frontend/` (React + Vite)
- `backend/` (Node.js + Express)

## Run Locally

**Prerequisites:**  Node.js

### Backend
1. `cd backend`
2. `npm install`
3. Create `.env` with your backend secrets (Mongo, Square, Cloudinary, email, etc.)
4. Run: `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. Create `.env` with:
   - `VITE_API_BASE_URL=http://localhost:3000/api`
   - `VITE_SQUARE_APP_ID=...`
   - `VITE_SQUARE_LOCATION_ID=...`
   - `VITE_WHATSAPP_NUMBER=...`
4. Run: `npm run dev`

## Vercel Deployment
- **Frontend**: import the repo in Vercel and set the project root to `frontend/`.
- **Backend**: create a second Vercel project with root set to `backend/`.
- Set backend env vars in the backend project, and set `VITE_API_BASE_URL` to the backend URL in the frontend project.
