"""
Migration script to add voucher columns to the orders table.
Run this once: python add_voucher_columns.py
"""

from sqlalchemy import text
from app.database import engine

def add_voucher_columns():
    """Add voucher_id, voucher_code, and voucher_discount columns to orders table."""

    with engine.connect() as conn:
        # Check if columns exist first
        result = conn.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'orders' AND column_name IN ('voucher_id', 'voucher_code', 'voucher_discount')
        """))
        existing_columns = [row[0] for row in result.fetchall()]

        # Add voucher_id column if not exists
        if 'voucher_id' not in existing_columns:
            print("Adding voucher_id column...")
            conn.execute(text("""
                ALTER TABLE orders
                ADD COLUMN voucher_id INTEGER REFERENCES vouchers(id)
            """))
            print("voucher_id column added.")
        else:
            print("voucher_id column already exists.")

        # Add voucher_code column if not exists
        if 'voucher_code' not in existing_columns:
            print("Adding voucher_code column...")
            conn.execute(text("""
                ALTER TABLE orders
                ADD COLUMN voucher_code VARCHAR(50)
            """))
            print("voucher_code column added.")
        else:
            print("voucher_code column already exists.")

        # Add voucher_discount column if not exists
        if 'voucher_discount' not in existing_columns:
            print("Adding voucher_discount column...")
            conn.execute(text("""
                ALTER TABLE orders
                ADD COLUMN voucher_discount FLOAT DEFAULT 0
            """))
            print("voucher_discount column added.")
        else:
            print("voucher_discount column already exists.")

        conn.commit()
        print("\nMigration completed successfully!")

if __name__ == "__main__":
    add_voucher_columns()
