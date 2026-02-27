from fastapi import FastAPI
from app.routes.listings import listings_router

app = FastAPI()

# register listings routes
app.include_router(listings_router)