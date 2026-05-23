from pydantic import BaseModel, Field
from typing import Optional


class DriveRoundBase(BaseModel):
    sequence_no: int = Field(..., gt=0)
    round_name: str
    round_type: str
    description: Optional[str] = None
    is_elimination_round: bool = True
    is_optional: bool = False
    mode: Optional[str] = None


class DriveRoundCreate(DriveRoundBase):
    drive_id: int


class DriveRoundUpdate(BaseModel):
    sequence_no: Optional[int] = None
    round_name: Optional[str] = None
    round_type: Optional[str] = None
    description: Optional[str] = None
    is_elimination_round: Optional[bool] = None
    is_optional: Optional[bool] = None
    mode: Optional[str] = None


class DriveRoundResponse(DriveRoundBase):
    id: int
    drive_id: int

    class Config:
        from_attributes = True
