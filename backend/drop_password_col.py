from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:arya%40123@localhost:5433/placement_db"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE students DROP COLUMN IF EXISTS password;"))
        conn.commit()
    print("Successfully dropped password column from students table.")
except Exception as e:
    print("Error dropping password column:", e)
