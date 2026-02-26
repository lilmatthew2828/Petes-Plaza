"""
    This module sets up the database connection and session management 
    for the Pete's Plaza application using SQLAlchemy.
    It loads the database URL from environment variables, 
    creates an engine, and defines a session factory and base class for ORM models. 
    The `get_db` function provides a way to get a database session that can be used in 
    API endpoints, ensuring that sessions are properly closed after use.
""" 

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

DATABASE_URL = os.getenv("DATABASE_URL") # loads the url for our Pete's Plaza database from the .env file

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set. Please check your .env file.")

engine = create_engine(DATABASE_URL, 
                       pool_pre_ping=True, # helps avoid the stale connections
                       echo=True) # Create the SQLAlchemy engine with the database URL

SesionLocal = sessionmaker(
    autocommit=False, # we want to control when transactions are committed
    autoflush=False, # we want to control when changes are flushed to the database
    bind=engine # bind the session to our engine so it knows how to connect to the database
)

Base = declarative_base() # Base class for our ORM models, we will inherit from this in our models.py file to define our database tables as Python classes

def get_db():
    db = SesionLocal() # create a new database session
    try:
        yield db # yield the session to be used in our API endpoints
    finally:
        db.close() # make sure to close the session after we're done to free up resources
print("DATABASE_URL:", DATABASE_URL)