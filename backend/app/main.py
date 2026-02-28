#EMMANUELLA OBIDIKE
# MAIN FILE
# This starts our FastAPI backend

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import listings routes
from app.routes.listings import listings_router


# create the main app
app = FastAPI()


# allow React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # later replace with frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)


# connect listings routes to the app
app.include_router(listings_router)