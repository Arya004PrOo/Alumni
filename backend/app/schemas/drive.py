from datetime import datetime

from pydantic import BaseModel


class DriveCreate(BaseModel):
    company_id: int
    drive_name: str
    description: str | None = None
    drive_date: datetime
    location: str | None = None
    eligibility_criteria: str | None = None


class DriveUpdate(BaseModel):
    company_id: int | None = None
    drive_name: str | None = None
    description: str | None = None
    drive_date: datetime | None = None
    location: str | None = None
    eligibility_criteria: str | None = None


class DriveResponse(DriveCreate):
    id: int
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
