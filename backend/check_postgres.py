import os
import sys
from dotenv import load_dotenv
import psycopg2
from urllib.parse import urlparse

# Load .env explicitly to ensure we get the updated DATABASE_URL
load_dotenv()

database_url = os.getenv("DATABASE_URL")
if not database_url or not database_url.startswith("postgresql"):
    print("DATABASE_URL is not set to postgresql")
    sys.exit(1)

print(f"Connecting to {database_url}...")

try:
    # Parse the URL to get components
    result = urlparse(database_url)
    username = result.username
    password = result.password
    database = result.path[1:]
    hostname = result.hostname
    port = result.port
    
    # Try connecting to the default 'postgres' database to check server availability
    conn = psycopg2.connect(
        dbname="postgres",
        user=username,
        password=password,
        host=hostname,
        port=port
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Check if target database exists
    cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{database}'")
    exists = cursor.fetchone()
    
    if not exists:
        print(f"Database '{database}' does not exist. Creating it...")
        cursor.execute(f"CREATE DATABASE {database}")
        print(f"Database '{database}' created successfully.")
    else:
        print(f"Database '{database}' already exists.")
        
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
