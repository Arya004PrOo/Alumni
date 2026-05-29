from sqlalchemy import Column, Integer, String

from app.database import Base


class Alumni(Base):
    __tablename__ = "alumni"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

    company = Column(String)
    designation = Column(String)
    company_type = Column(String)
    linkedin_url = Column(String)
    graduation_year = Column(Integer)
    skills = Column(String)

    invited_by_admin = Column(Integer)

class AlumniInvite(Base):
    __tablename__ = "alumni_invites"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    status = Column(String, default="pending")
