from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User
from app.config import settings
import sys

# Override database URL to ensure absolute path if needed, or use settings
DATABASE_URL = settings.database_url
print(f"Connecting to {DATABASE_URL}")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_db_insert():
    db = SessionLocal()
    try:
        # Check if we can query
        print("Querying users...")
        count = db.query(User).count()
        print(f"User count: {count}")
        
        # Try to insert a dummy user
        print("Attempting to insert test user...")
        user = User(
            name="Test User",
            email="test_debug@example.com",
            phone="01700000000",
            password_hash="hash",
            role="user"
        )
        db.add(user)
        db.commit()
        print("Insert successful!")
        
        # Cleanup
        db.delete(user)
        db.commit()
        print("Cleanup successful!")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    test_db_insert()
