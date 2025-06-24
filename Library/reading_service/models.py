from sqlalchemy import Column, String, Integer, ForeignKey
from reading_service.database import Base

class ReadingProgress(Base):
    __tablename__ = "reading_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)  # теперь строка (UUID)
    book_id = Column(Integer, index=True)
    current_page = Column(Integer)
