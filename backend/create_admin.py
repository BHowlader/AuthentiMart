"""
Script to create an admin user in the database
"""
from app.database import SessionLocal
from app.models import User, UserRole
from app.utils import get_password_hash

def create_admin_user():
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        admin_email = "bibekhowlader8@gmail.com"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            print(f"✅ Admin user already exists: {admin_email}")
            print(f"   Role: {existing_admin.role}")
            print(f"   Active: {existing_admin.is_active}")
            return
        
        # Create admin user
        admin_user = User(
            name="Admin",
            email=admin_email,
            phone="+8801234567890",
            password_hash=get_password_hash("Admin123!"),
            role=UserRole.ADMIN,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✅ Admin user created successfully!")
        print(f"   Email: {admin_email}")
        print(f"   Password: Admin123!")
        print(f"   Role: {admin_user.role}")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
