from sqlalchemy.orm import Session
from reading_service import models, schemas

def upsert_reading_progress(db: Session, progress: schemas.ReadingStart):
    db_progress = db.query(models.ReadingProgress).filter_by(
        user_id=progress.user_id, book_id=progress.book_id
    ).first()

    if db_progress:
        db_progress.current_page = progress.page
    else:
        db_progress = models.ReadingProgress(
            user_id=progress.user_id,
            book_id=progress.book_id,
            current_page=progress.page
        )
        db.add(db_progress)

    db.commit()
    db.refresh(db_progress)
    return db_progress

def get_user_progress(db: Session, user_id: str):
    return db.query(models.ReadingProgress).filter_by(user_id=user_id).all()
