from sqlalchemy import create_engine, inspect

DATABASE_URL = "postgresql://postgres:arya%40123@localhost:5433/placement_db"
engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

columns = inspector.get_columns('students')
print("Columns in 'students' table:")
for col in columns:
    print(f"- {col['name']}: {col['type']}")
