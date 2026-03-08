# 💧 Water Quality Sentinel

A full-stack web application for monitoring, submitting, and analysing water quality data across geographic locations. Compare measurements against **WHO** and **Nigerian Standard for Drinking Water Quality (NSDQW)** standards, and visualise results on an interactive Leaflet.js heatmap.

---

## 🗂 Directory Structure

```
water-quality-sentine/
├── backend/                        # Node.js/Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # MongoDB connection
│   │   ├── models/
│   │   │   ├── WaterQuality.js     # Water parameters + geolocation schema
│   │   │   └── ResistivityData.js  # Geophysical resistivity survey schema
│   │   ├── routes/
│   │   │   ├── waterStatus.js      # GET/POST /api/water-status
│   │   │   ├── waterData.js        # CRUD /api/water-data
│   │   │   └── resistivity.js      # CRUD /api/resistivity
│   │   ├── controllers/
│   │   │   ├── waterStatusController.js
│   │   │   ├── waterDataController.js
│   │   │   └── resistivityController.js
│   │   ├── services/
│   │   │   └── analysisService.js  # WHO/NSDQW analytical engine + Safety Score
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   └── app.js
│   ├── server.js                   # Entry point
│   ├── Procfile                    # Heroku deployment
│   ├── Dockerfile                  # Container image
│   ├── package.json
│   └── .env.example
├── frontend/                       # React + Vite + Leaflet.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/                # Leaflet heatmap + markers
│   │   │   ├── Dashboard/          # Geospatial dashboard
│   │   │   ├── WaterDataForm/      # Data submission form
│   │   │   ├── SafetyScore/        # Animated gauge component
│   │   │   └── Navbar/
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   ├── test/                   # Vitest unit tests
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile                  # Multi-stage build + nginx
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── docker-compose.yml              # Digital Ocean Droplet deployment
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD: test → Heroku / GitHub Pages / DO
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Backend

```bash
cd backend
cp .env.example .env          # edit MONGODB_URI as needed
npm install
npm run dev                   # runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:5000
npm install
npm run dev                   # runs on http://localhost:5173
```

---

## 🐳 Docker Compose (Digital Ocean)

```bash
cp backend/.env.example .env
# set MONGODB_URI, FRONTEND_URL, etc.
docker compose up -d
```

The app will be available at `http://<your-droplet-ip>`.

---

## 🔌 API Reference

### `GET /api/water-status`
Returns the water safety status near GPS coordinates.

| Query param | Type   | Description                        |
|-------------|--------|------------------------------------|
| `lat`       | float  | Latitude (-90 to 90)               |
| `lng`       | float  | Longitude (-180 to 180)            |
| `radius`    | int    | Search radius in metres (default 5000) |

**Example:**
```
GET /api/water-status?lat=6.857&lng=7.393&radius=5000
```

### `POST /api/water-status`
Analyse water parameters without saving to the database.

```json
{
  "lat": 6.857, "lng": 7.393,
  "ph": 7.2, "turbidity": 2.1, "tds": 320, "conductivity": 580,
  "locationName": "Nsukka Borehole"
}
```

**Response includes:**
- `safetyScore` (0–100)
- `safetyRating` (Safe / Marginal / Unsafe / Highly Unsafe)
- `whoCompliance` — per-parameter WHO compliance flags
- `nsdqwCompliance` — per-parameter NSDQW compliance flags
- `parameterDetails` — limits, units, and compliance per parameter

### `POST /api/water-data`
Submit and persist new water quality data (same payload as above, plus optional `temperature`, `dissolvedOxygen`, `recordedBy`, `notes`).

### `GET /api/water-data`
List all records (optional bounding-box query params: `swLat`, `swLng`, `neLat`, `neLng`).

### `POST /api/resistivity`
Submit geophysical resistivity survey data (VES layers, aquifer characteristics, contamination risk).

---

## 📊 Water Quality Standards

| Parameter    | WHO Limit       | NSDQW Limit     |
|--------------|-----------------|-----------------|
| pH           | 6.5 – 8.5       | 6.5 – 8.5       |
| Turbidity    | ≤ 4 NTU         | ≤ 5 NTU         |
| TDS          | ≤ 1000 mg/L     | ≤ 500 mg/L      |
| Conductivity | ≤ 2500 µS/cm    | ≤ 1000 µS/cm    |

---

## 🧪 Running Tests

```bash
# Backend (Jest)
cd backend && npm test

# Frontend (Vitest)
cd frontend && npm test
```

---

## 🚢 Deployment

### Heroku
1. Create a Heroku app and add the `MONGODB_URI` config var.
2. Set `HEROKU_API_KEY`, `HEROKU_APP_NAME`, `HEROKU_EMAIL` as GitHub secrets.
3. Push to `main` — the GitHub Actions workflow auto-deploys.

### GitHub Pages (Frontend)
The workflow builds the frontend and pushes to the `gh-pages` branch automatically on push to `main`.

### Digital Ocean (Docker)
Set `DEPLOY_TARGET=digitalocean` as a GitHub repository variable and provide `DO_HOST`, `DO_USER`, `DO_SSH_KEY`, `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` as secrets.

---

## 🗺 Features

- **Interactive Leaflet.js Map** — heatmap overlay showing water quality risk zones; coloured markers per safety rating
- **Geospatial Dashboard** — click any marker to see full parameter breakdown
- **Analytical Engine** — automatic Safety Score (0–100) with WHO & NSDQW compliance checks
- **Data Submission Form** — click the map to pre-fill GPS coordinates
- **Resistivity Schema** — correlate VES survey data with groundwater contamination risk
- **Responsive UI** — mobile-friendly layout