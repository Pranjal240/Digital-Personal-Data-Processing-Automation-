
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL is missing from .env")

try:
    conn = psycopg2.connect(database_url, connect_timeout=5)
    cur = conn.cursor()

    cur.execute("""
        SELECT current_database(), current_user;
    """)

    database, user = cur.fetchone()

    print("PostgreSQL connection successful!")
    print("Database:", database)
    print("User:", user)

    cur.close()
    conn.close()

except Exception as error:
    print("PostgreSQL connection failed:")
    print(type(error).__name__, str(error))
