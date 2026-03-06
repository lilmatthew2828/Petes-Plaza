#Jania Southall - whole file
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
    # Ensure password is a string and truncate to 72 characters for bcrypt
    if not isinstance(password, str):
        password = str(password)
    password = password[:72]
    print("password length after truncation:", len(password.encode('utf-8')))  # Debug: print byte length of password
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