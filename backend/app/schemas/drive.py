from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DriveCreate(BaseModel):
    company_id: int
    drive_name: str
    description: Optional[str] = None
    drive_date: datetime
    location: Optional[str] = None
    eligibility_criteria: Optional[str] = None


class DriveUpdate(BaseModel):
    company_id: Optional[int] = None
    drive_name: Optional[str] = None
    description: Optional[str] = None
    drive_date: Optional[datetime] = None
    location: Optional[str] = None
    eligibility_criteria: Optional[str] = None


class DriveResponse(DriveCreate):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None   

    class Config:
        from_attributes = True