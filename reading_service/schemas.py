from pydantic import BaseModel

class ReadingStart(BaseModel):
    user_id: str  # UUID как строка
    book_id: int
    page: int

class ReadingProgressOut(BaseModel):
    book_id: int
    page: int
