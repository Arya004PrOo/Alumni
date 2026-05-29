from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class Drive(Base):
    __tablename__ = "drives"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, nullable=False)
    drive_name = Column(String(100), nullable=False)
    description = Column(Text)
    drive_date = Column(DateTime, nullable=False)
    location = Column(String(100))
    eligibility_criteria = Column(String(255))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
