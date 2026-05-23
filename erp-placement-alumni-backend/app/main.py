from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import alumni

from app.routes.admin_company import router as admin_company_router
from app.routes.student import router as student_router
from app.routes.admin_drive import router as admin_drive_router
from app.routes.admin_round import router as admin_round_router
from app.routes.admin_alumni import router as alumni_router
from app.routes.notifications import router as notifications_router

app = FastAPI(title="College ERP – Placement + Alumni Backend")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #for dev (later restrict to http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_company_router)
app.include_router(student_router)
app.include_router(admin_drive_router)
app.include_router(admin_round_router)
app.include_router(alumni_router)
app.include_router(notifications_router)


@app.get("/")
def root():
    return {"message": "ERP Placement + Alumni Backend is running "}