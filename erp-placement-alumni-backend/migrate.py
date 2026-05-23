from app.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE alumni ADD COLUMN skills VARCHAR;"))
        conn.commit()
    print("Successfully added skills column to alumni table.")
except Exception as e:
    print("Error altering table (it might already exist or another issue):", e)
