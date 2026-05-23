from sqlalchemy import Column, Integer, String, Float, Boolean
from app.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    university_roll_number = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    branch = Column(String, nullable=False)
    cgpa = Column(Float, nullable=False)
    batch = Column(Integer, nullable=False)
    is_alumni = Column(Boolean, default=False)
    password = Column(String, nullable=False)