from pydantic import BaseModel

class StudentCreate(BaseModel):
    university_roll_number: str
    full_name: str
    branch: str
    cgpa: float
    batch: int
    password: str

class StudentLogin(BaseModel):
    university_roll_number: str
    password: str

class StudentOut(BaseModel):
    id: int
    university_roll_number: str
    full_name: str
    branch: str
    cgpa: float
    batch: int

    class Config:
        from_attributes = True