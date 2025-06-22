from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from reading_service import crud, schemas
from reading_service.database import SessionLocal

router = APIRouter(prefix="/reading", tags=["Reading"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/start")
async def start_reading(progress: schemas.ReadingStart, db: Session = Depends(get_db)):
    return crud.upsert_reading_progress(db, progress)

@router.get("/progress/{user_id}")
def get_progress(user_id: str, db: Session = Depends(get_db)):
    return crud.get_user_progress(db, user_id)
