from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.alumni import Alumni, AlumniInvite
from app.schemas.alumni import AlumniCreate, AlumniResponse, AlumniInviteCreate
from app.utils.notifications import send_single_notification
from app.utils.security import verify_token

router = APIRouter(prefix="/alumni", tags=["Alumni"], dependencies=[Depends(verify_token)])


@router.post("/add", response_model=AlumniResponse)
def add_alumni(alumni: AlumniCreate, db: Session = Depends(get_db)):
    try:
        existing_email = db.query(Alumni).filter(Alumni.email == alumni.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")

        new_alumni = Alumni(
            full_name=alumni.full_name,
            email=alumni.email,
            company=alumni.company,
            designation=alumni.designation,
            company_type=alumni.company_type,
            linkedin_url=alumni.linkedin_url,
            graduation_year=alumni.graduation_year,
            skills=alumni.skills,
            invited_by_admin=1
        )

        db.add(new_alumni)
        db.commit()
        db.refresh(new_alumni)

        # Trigger Notification
        send_single_notification(
            event_type="Alumni Registration",
            title="Welcome to the Alumni Network!",
            message=f"Hello {new_alumni.full_name}, you have been successfully added to the Alumni Connect Hub. Welcome aboard!",
            recipient_emails=[new_alumni.email]
        )

        return new_alumni

    except Exception as e:
        db.rollback()
        print("ACTUAL ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/invite")
def invite_alumni(invite: AlumniInviteCreate, db: Session = Depends(get_db)):
    # Check if already alumni
    existing_alumni = db.query(Alumni).filter(Alumni.email == invite.email).first()
    if existing_alumni:
        raise HTTPException(status_code=400, detail="User is already registered as alumni")

    # Check if already invited
    existing_invite = db.query(AlumniInvite).filter(AlumniInvite.email == invite.email).first()
    if existing_invite:
        raise HTTPException(status_code=400, detail="Invite already sent to this email")

    new_invite = AlumniInvite(email=invite.email, status="pending")
    db.add(new_invite)
    db.commit()
    
    # Trigger Notification
    send_single_notification(
        event_type="Alumni Invitation",
        title="Exclusive Invitation: Join Alumni Connect",
        message="You have been invited to join the PVG's COSC Alumni Network. Please register to connect with your peers and track placement opportunities.",
        recipient_emails=[invite.email]
    )

    return {"message": f"Successfully sent invite to {invite.email}"}


@router.get("/count")
def count_alumni(db: Session = Depends(get_db)):
    total = db.query(Alumni).count()
    return {"total_alumni": total}


@router.get("/analytics/company")
def get_alumni_per_company(db: Session = Depends(get_db)):
    results = db.query(Alumni.company, func.count(Alumni.id).label("count")) \
                .filter(Alumni.company != None, Alumni.company != "") \
                .group_by(Alumni.company).all()
    
    # Sort by count descending and take top companies
    sorted_results = sorted([{"name": r[0], "value": r[1]} for r in results], key=lambda x: x["value"], reverse=True)
    return sorted_results


@router.get("/analytics/year")
def get_alumni_per_year(db: Session = Depends(get_db)):
    results = db.query(Alumni.graduation_year, func.count(Alumni.id).label("count")) \
                .filter(Alumni.graduation_year != None) \
                .group_by(Alumni.graduation_year) \
                .order_by(Alumni.graduation_year).all()
                
    return [{"name": str(r[0]), "value": r[1]} for r in results]


from typing import Optional
from fastapi.responses import StreamingResponse
import io
import csv

@router.get("/export")
def export_alumni_csv(
    search: Optional[str] = None,
    year: Optional[int] = None,
    skill: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alumni)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Alumni.full_name.ilike(search_term)) |
            (Alumni.email.ilike(search_term)) |
            (Alumni.company.ilike(search_term)) |
            (Alumni.company_type.ilike(search_term)) |
            (Alumni.designation.ilike(search_term)) |
            (Alumni.skills.ilike(search_term))
        )
    if year:
        query = query.filter(Alumni.graduation_year == year)
    if skill:
        query = query.filter(Alumni.skills.ilike(f"%{skill}%"))
        
    alumni = query.all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Full Name", "Email", "Company", "Company Type", "Designation", "Graduation Year", "Skills", "LinkedIn"])
    
    for a in alumni:
        writer.writerow([
            a.id, a.full_name, a.email, a.company or "", a.company_type or "", a.designation or "", 
            a.graduation_year, a.skills or "", a.linkedin_url or ""
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=alumni_export.csv"}
    )


@router.get("/", response_model=list[AlumniResponse])
def get_all_alumni(
    search: Optional[str] = None,
    year: Optional[int] = None,
    skill: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc",
    db: Session = Depends(get_db)
):
    query = db.query(Alumni)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Alumni.full_name.ilike(search_term)) |
            (Alumni.email.ilike(search_term)) |
            (Alumni.company.ilike(search_term)) |
            (Alumni.company_type.ilike(search_term)) |
            (Alumni.designation.ilike(search_term)) |
            (Alumni.skills.ilike(search_term))
        )
        
    if year:
        query = query.filter(Alumni.graduation_year == year)
        
    if skill:
        query = query.filter(Alumni.skills.ilike(f"%{skill}%"))
        
    if sort_by:
        column = getattr(Alumni, sort_by, None)
        if column:
            if sort_order == "desc":
                query = query.order_by(column.desc())
            else:
                query = query.order_by(column.asc())
                
    return query.all()


@router.delete("/{alumni_id}")
def delete_alumni(alumni_id: int, db: Session = Depends(get_db)):
    alumni = db.query(Alumni).filter(Alumni.id == alumni_id).first()
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni not found")
        
    db.delete(alumni)
    db.commit()
    return {"message": "Alumni deleted successfully"}


@router.put("/{alumni_id}", response_model=AlumniResponse)
def update_alumni(alumni_id: int, alumni_data: AlumniCreate, db: Session = Depends(get_db)):
    db_alumni = db.query(Alumni).filter(Alumni.id == alumni_id).first()
    if not db_alumni:
        raise HTTPException(status_code=404, detail="Alumni not found")
        
    # Update fields
    db_alumni.full_name = alumni_data.full_name
    db_alumni.email = alumni_data.email
    db_alumni.company = alumni_data.company
    db_alumni.company_type = alumni_data.company_type
    db_alumni.designation = alumni_data.designation
    db_alumni.linkedin_url = alumni_data.linkedin_url
    db_alumni.graduation_year = alumni_data.graduation_year
    db_alumni.skills = alumni_data.skills
    
    try:
        db.commit()
        db.refresh(db_alumni)
        return db_alumni
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
