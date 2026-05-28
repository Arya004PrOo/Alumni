from sqlalchemy import Column, Integer, String
from app.database import Base

class Company(Base):#her we are creating a class named company which is inheriting from the base class which we have created in database.py
    __tablename__ = "companies" #this is the name of the table which will be created in the database

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    job_role = Column(String)
    package = Column(String)
    mou_file = Column(String)
