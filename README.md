# Frontend (Vite + React)

This frontend talks to a backend API. You can configure the API base URL using the Vite env var `VITE_API_URL`.

- Deployed backend: https://student-portal-backend-qs4a.onrender.com/
- Deployed frontend (login): https://student-portal-e3kb9q12r-kuro-shivs-projects.vercel.app/login

Local development defaults to `http://localhost:4000` unless `VITE_API_URL` is provided.

How to set the API URL:

1. Locally (temporary):

	- Start dev server with an env var:

	```powershell
	$env:VITE_API_URL = "https://student-portal-backend-qs4a.onrender.com/"
	npm run dev
	```

2. For production builds, create `frontend/.env.production` (or set the variable in your host):

	- Example file (already provided): `frontend/.env.production` contains `VITE_API_URL=https://student-portal-backend-qs4a.onrender.com/`

Notes:

- The frontend code uses `import.meta.env.VITE_API_URL` with a `http://localhost:4000` fallback. See `frontend/src/services/api.js`.
- On Vercel, set the environment variable `VITE_API_URL` in the project settings to the backend URL for builds.


