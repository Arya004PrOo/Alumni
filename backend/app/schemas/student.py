from pydantic import BaseModel


class StudentCreate(BaseModel):
    student_id: str

class StudentOut(BaseModel):
    id: int
    student_id: str

    class Config:
        from_attributes = True
