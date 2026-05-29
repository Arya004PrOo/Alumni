
from pydantic import BaseModel, EmailStr


class AlumniCreate(BaseModel):
    full_name: str
    email: EmailStr
    company: str | None = None
    designation: str | None = None
    company_type: str | None = None
    linkedin_url: str | None = None
    graduation_year: int
    skills: str | None = None


class AlumniResponse(BaseModel):
    id: int
    full_name: str
    email: str
    company: str | None
    designation: str | None
    company_type: str | None
    graduation_year: int
    skills: str | None
    linkedin_url: str | None = None

    class Config:
        from_attributes = True

class AlumniInviteCreate(BaseModel):
    email: EmailStr