from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class DriveRound(Base):
    __tablename__ = "drive_round"

    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, nullable=False)

    sequence_no = Column(Integer, nullable=False)
    round_name = Column(String(100), nullable=False)
    round_type = Column(String(50), nullable=False)
    description = Column(Text)

    is_elimination_round = Column(Boolean, default=True)
    is_optional = Column(Boolean, default=False)
    mode = Column(String(50))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
