from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import admin


from app.config import settings
from app.database import engine
from app.database import Base
from app.auth import router as auth_router

# Create tables on startup
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Petes Plaza",
    version="0.1.0",
    debug=settings.debug,
)

# Add CORS middleware
# Will change in production to only allow the frontend origin
# allow the origin that your Vite server is running on
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "Petes Plaza API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}