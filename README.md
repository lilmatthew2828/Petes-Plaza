# Pete's Plaza

A full-stack marketplace application for buying and selling secondhand items. Built with React, Vite, FastAPI, and PostgreSQL.

## Project Structure

```
Petes-Plaza/
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── pages/    # HomePage, AdminDashboard
│   │   ├── styles/   # CSS files
│   │   └── api/      # API helpers
│   ├── package.json
│   └── vite.config.js
├── backend/           # FastAPI server
│   ├── app/
│   │   ├── main.py   # App entry point
│   │   ├── routes/   # API routes (admin, etc.)
│   │   ├── services/ # Business logic
│   │   ├── schemas/  # Pydantic models
│   │   ├── models/   # SQLAlchemy ORM
│   │   └── database.py
│   └── .env          # Database credentials
└── README.md
```

## Prerequisites

- **Node.js 16+** (for frontend)
- **Python 3.9+** (for backend)
- **PostgreSQL** (RDS or local instance)

## Setup & Running

### Backend Setup

```bash
# Navigate to backend
cd Petes-Plaza/backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# or: .venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure database
# Edit .env with your PostgreSQL credentials:
# DATABASE_URL=postgresql+psycopg2://user:password@host:5432/dbname?sslmode=require

# Start backend server
uvicorn app.main:app --reload --port 8000
```

Backend runs on **http://localhost:8000**

### Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd Petes-Plaza/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on **http://localhost:5173**

## Features

- **Home Page**: Browse all listings by category
- **Admin Dashboard**: View metrics, manage listings, mark items as sold, delete listings
- **Responsive Design**: Works on desktop and mobile

## API Endpoints

- `GET /api/admin/metrics` - Dashboard metrics (total users, listings, active listings)
- `GET /api/admin/listings` - Fetch all listings
- `POST /api/admin/listings/{id}/moderate` - Moderate a listing

## Notes

- Images without URLs default to `listing_placeholder.png`
- Pydantic warning about `orm_mode` is safe to ignore (using `from_attributes` as fallback)
- Database connection uses `sslmode=require` for RDS compatibility



