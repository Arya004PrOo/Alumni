from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.drive import Drive
from app.schemas.drive import DriveCreate, DriveUpdate, DriveResponse
from app.utils.notifications import send_bulk_notification

router = APIRouter(prefix="/admin/drive", tags=["Admin - Drive"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=DriveResponse)
def create_drive(data: DriveCreate, db: Session = Depends(get_db)):
    """Admin can create a new placement drive"""
    drive = Drive(**data.dict())
    db.add(drive)
    db.commit()
    db.refresh(drive)

    # Trigger Bulk Notification to Students
    send_bulk_notification(
        event_type="New Placement Drive",
        title=f"New Recruitment Drive: {drive.drive_name}",
        message=f"A new placement drive for {drive.drive_name} has been scheduled for {drive.drive_date}. Check the portal for eligibility details!",
        recipient_roles=["student"]
    )

    return drive


@router.get("/", response_model=list[DriveResponse])
def view_all_drives(db: Session = Depends(get_db)):
    """View all placement drives"""
    return db.query(Drive).all()


@router.get("/{drive_id:int}", response_model=DriveResponse)
def get_drive(drive_id: int, db: Session = Depends(get_db)):
    """Get a specific drive by ID"""
    drive = db.query(Drive).filter(Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    return drive


@router.get("/company/{company_id}", response_model=list[DriveResponse])
def get_drives_by_company(company_id: int, db: Session = Depends(get_db)):
    """Get all drives for a specific company"""
    drives = db.query(Drive).filter(Drive.company_id == company_id).all()
    return drives


@router.put("/{drive_id}", response_model=DriveResponse)
def update_drive(drive_id: int, data: DriveUpdate, db: Session = Depends(get_db)):
    """Admin can update drive details"""
    drive = db.query(Drive).filter(Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(drive, key, value)
    
    db.commit()
    db.refresh(drive)
    return drive


@router.delete("/{drive_id}")
def delete_drive(drive_id: int, db: Session = Depends(get_db)):
    """Admin can delete a drive"""
    drive = db.query(Drive).filter(Drive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
    
    db.delete(drive)
    db.commit()
    return {"message": "Drive deleted successfully"}
