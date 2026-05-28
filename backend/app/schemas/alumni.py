from pydantic import BaseModel, EmailStr
from typing import Optional

class AlumniCreate(BaseModel):
    full_name: str
    email: EmailStr
    company: Optional[str] = None
    designation: Optional[str] = None
    company_type: Optional[str] = None
    linkedin_url: Optional[str] = None
    graduation_year: int
    skills: Optional[str] = None


class AlumniResponse(BaseModel):
    id: int
    full_name: str
    email: str
    company: Optional[str]
    designation: Optional[str]
    company_type: Optional[str]
    graduation_year: int
    skills: Optional[str]
    linkedin_url: Optional[str] = None

    class Config:
        from_attributes = True

class AlumniInviteCreate(BaseModel):
    email: EmailStr