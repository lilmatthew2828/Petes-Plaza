from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import admin
from app.routes import listings
from app.routes.wishlist import router as wishlist_router  #Matthew Kilpatrick
from app.routes.listings import listings_router
from app.routes import listings, admin, purchaseHistory


from app.config import settings
from app.database import engine
from app.database import Base
from app.auth import router as auth_router
from app.routes.uploads import router as uploads_router #Emmanuella Obidike

 

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
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8000", "http://127.0.0.1:3000"] ,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(admin.router)
app.include_router(listings.router)
app.include_router(wishlist_router)
app.include_router(listings_router)
app.include_router(purchaseHistory.router)
app.include_router(uploads_router) #Emmanuella Obidike

@app.get("/")
def root():
    return {"message": "Petes Plaza API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
