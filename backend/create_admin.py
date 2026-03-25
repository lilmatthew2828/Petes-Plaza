# Anthony Powell
# Run this script from the backend/ directory to create an admin account
# directly in the database with a properly bcrypt-hashed password.
#
# Usage:
#   python create_admin.py
#
# You will be prompted for email, username, student_id, and password.
# The email MUST end with @petesplaza.com.

import sys
import os
import getpass

# Make sure the app package is importable when running from backend/
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models import User
from app.security import hash_password
from datetime import datetime


def main():
    print("=== Pete's Plaza Admin Account Creator ===\n")

    email = input("Admin email (@petesplaza.com): ").strip().lower()
    if not email.endswith("@petesplaza.com"):
        print("Error: Admin email must end with @petesplaza.com")
        sys.exit(1)

    username = input("Username: ").strip()
    if not username:
        print("Error: Username cannot be empty")
        sys.exit(1)

    try:
        student_id = int(input("Student ID (integer): ").strip())
    except ValueError:
        print("Error: Student ID must be an integer")
        sys.exit(1)

    password = getpass.getpass("Password: ")
    confirm = getpass.getpass("Confirm password: ")
    if password != confirm:
        print("Error: Passwords do not match")
        sys.exit(1)

    if len(password) < 8:
        print("Error: Password must be at least 8 characters")
        sys.exit(1)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()

        if existing:
            # Promote and update an existing account
            existing.password_hash = hash_password(password)
            existing.is_admin = True
            db.commit()
            print(f"\nExisting account updated. '{email}' is now an admin.")
        else:
            # Create a brand-new admin account
            user = User(
                email=email,
                username=username,
                student_id=student_id,
                password_hash=hash_password(password),
                created_at=datetime.utcnow().isoformat(),
                is_admin=True,
                is_suspended=False,
            )
            db.add(user)
            db.commit()
            print(f"\nAdmin account created for '{email}'.")
    except Exception as e:
        db.rollback()
        print(f"\nDatabase error: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
