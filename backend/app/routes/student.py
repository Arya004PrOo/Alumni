from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentOut
from app.api.v1.auth import verify_token

router = APIRouter(prefix="/student", tags=["Student"])

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ Register Student (JWT Protected)
@router.post("/register", response_model=StudentOut)
def register_student(
    data: StudentCreate, 
    db: Session = Depends(get_db), 
    token_data: dict = Depends(verify_token)
):
    existing = db.query(Student).filter(
        Student.student_id == data.student_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Student already exists")

    student = Student(student_id=data.student_id)
    db.add(student)
    db.commit()
    db.refresh(student)

    return student


# ✅ View All Students (JWT Protected)
@router.get("/", response_model=list[StudentOut])
def view_students(
    db: Session = Depends(get_db), 
    token_data: dict = Depends(verify_token)
):
    return db.query(Student).all()


# ✅ View Single Student (JWT Protected)
@router.get("/{student_id}", response_model=StudentOut)
def get_student(
    student_id: str, 
    db: Session = Depends(get_db), 
    token_data: dict = Depends(verify_token)
):
    student = db.query(Student).filter(Student.student_id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return student


# ✅ Update Student (JWT Protected)
@router.put("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: str, 
    data: StudentCreate, 
    db: Session = Depends(get_db), 
    token_data: dict = Depends(verify_token)
):
    student = db.query(Student).filter(Student.student_id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.student_id = data.student_id
    db.commit()
    db.refresh(student)

    return student