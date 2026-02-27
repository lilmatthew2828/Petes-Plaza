from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import admin

app = FastAPI()

origins = [
    "http://localhost:5173",  # Vite dev server
]

app.add_middleware( # Add CORS middleware to allow requests from the frontend
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(admin.router)