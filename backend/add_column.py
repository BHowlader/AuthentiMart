from app.database import engine
from sqlalchemy import text

def add_column():
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_custom_picture BOOLEAN DEFAULT FALSE;"))
            conn.commit()
            print("Column 'is_custom_picture' added successfully.")
    except Exception as e:
        print(f"Error adding column: {e}")

if __name__ == "__main__":
    add_column()
