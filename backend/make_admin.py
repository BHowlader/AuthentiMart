"""
Script to promote an existing user to admin
"""
import sys
import os
sys.path.append(os.getcwd())

from app.database import SessionLocal, engine, Base
from app.models import User, UserRole

def make_admin():
    db = SessionLocal()

    try:
        email = "bibekhowlader8@gmail.com"
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"User not found: {email}")
            return

        user.role = UserRole.ADMIN
        db.commit()

        print(f"User {email} is now an admin!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    make_admin()
