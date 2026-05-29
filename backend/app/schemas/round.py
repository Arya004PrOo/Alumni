
from pydantic import BaseModel, Field


class DriveRoundBase(BaseModel):
    sequence_no: int = Field(..., gt=0)
    round_name: str
    round_type: str
    description: str | None = None
    is_elimination_round: bool = True
    is_optional: bool = False
    mode: str | None = None


class DriveRoundCreate(DriveRoundBase):
    drive_id: int


class DriveRoundUpdate(BaseModel):
    sequence_no: int | None = None
    round_name: str | None = None
    round_type: str | None = None
    description: str | None = None
    is_elimination_round: bool | None = None
    is_optional: bool | None = None
    mode: str | None = None


class DriveRoundResponse(DriveRoundBase):
    id: int
    drive_id: int

    class Config:
        from_attributes = True
