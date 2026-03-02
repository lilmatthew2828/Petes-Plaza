#Jania Southall 
# Using passlib to use bycrypt for secure password hashing
from passlib.context import CryptContext
import os

# Bcrypt context for password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt(
    (bycript is an API/Package use to securely encrpt passwords)
    
    Args:
        password: plaintext password
    
    Returns:
        bcrypt hash
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Checks that plaintext password matched a bcrypt hash.
    
    Args:
        plain_password: plaintext password from user
        hashed_password: bcrypt hash from database
    
    Returns:
        True if password matches and False if not
    """
    return pwd_context.verify(plain_password, hashed_password)