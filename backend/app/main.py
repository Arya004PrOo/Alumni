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
from app.api.v1.auth import router as auth_router

app = FastAPI(title="College ERP – Placement + Alumni Backend")

Base.metadata.create_all(bind=engine)

import os
from dotenv import load_dotenv

load_dotenv()

allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5181,http://127.0.0.1:5181")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 prefixed routes
app.include_router(auth_router, prefix="/api/v1")
app.include_router(admin_company_router, prefix="/api/v1")
app.include_router(student_router, prefix="/api/v1")
app.include_router(admin_drive_router, prefix="/api/v1")
app.include_router(admin_round_router, prefix="/api/v1")
app.include_router(alumni_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")

# Fallback unprefixed routes
app.include_router(auth_router, prefix="/api")
app.include_router(admin_company_router)
app.include_router(student_router)
app.include_router(admin_drive_router)
app.include_router(admin_round_router)
app.include_router(alumni_router)
app.include_router(notifications_router)


@app.get("/")
def root():
    return {"message": "ERP Placement + Alumni Backend is running "}