# IPL Frontend Deployment

This is the main user-facing Vite frontend for the IPL Prediction app.

## Vercel settings

- Root directory: `frontend`
- Framework preset: `Vite`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

## Required environment variables

- `VITE_API_BASE_URL`
- `VITE_AUTH_PROVIDER`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`

## SPA routing

The app uses `react-router-dom` with browser history, so `vercel.json` rewrites all routes to `index.html`.
