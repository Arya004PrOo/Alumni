from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.models.round import DriveRound
from app.schemas.round import DriveRoundCreate, DriveRoundUpdate, DriveRoundResponse

router = APIRouter(prefix="/admin/drive-rounds", tags=["Admin - Drive Rounds"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=DriveRoundResponse)
def create_round(round_data: DriveRoundCreate, db: Session = Depends(get_db)):
    """Admin can create a new round for a placement drive"""
    existing = db.query(DriveRound).filter(
        DriveRound.drive_id == round_data.drive_id,
        DriveRound.sequence_no == round_data.sequence_no
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Round sequence already exists for this drive")

    db_round = DriveRound(**round_data.model_dump())
    db.add(db_round)
    db.commit()
    db.refresh(db_round)
    return db_round


@router.get("/drive/{drive_id}", response_model=List[DriveRoundResponse])
def get_rounds_by_drive(drive_id: int, db: Session = Depends(get_db)):
    """Get all rounds for a specific drive"""
    return db.query(DriveRound).filter(
        DriveRound.drive_id == drive_id
    ).order_by(DriveRound.sequence_no).all()


@router.get("/{round_id}", response_model=DriveRoundResponse)
def get_round(round_id: int, db: Session = Depends(get_db)):
    """Get a specific round by ID"""
    db_round = db.query(DriveRound).filter(DriveRound.id == round_id).first()

    if not db_round:
        raise HTTPException(status_code=404, detail="Round not found")

    return db_round


@router.put("/{round_id}", response_model=DriveRoundResponse)
def update_round(round_id: int, data: DriveRoundUpdate, db: Session = Depends(get_db)):
    """Admin can update round details"""
    db_round = db.query(DriveRound).filter(DriveRound.id == round_id).first()

    if not db_round:
        raise HTTPException(status_code=404, detail="Round not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(db_round, key, value)

    db.commit()
    db.refresh(db_round)
    return db_round


@router.delete("/{round_id}")
def delete_round(round_id: int, db: Session = Depends(get_db)):
    """Admin can delete a round"""
    db_round = db.query(DriveRound).filter(DriveRound.id == round_id).first()

    if not db_round:
        raise HTTPException(status_code=404, detail="Round not found")

    db.delete(db_round)
    db.commit()
    return {"message": "Round deleted successfully"}
