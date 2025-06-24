from fastapi import APIRouter, Request, HTTPException, Depends, UploadFile, File, Form
from api_gateway.dependencies import get_current_user
import httpx

router = APIRouter()

BOOK_SERVICE_URL = "http://localhost:8002/books"

@router.get("/")
async def get_books():
    async with httpx.AsyncClient() as client:
        response = await client.get(BOOK_SERVICE_URL)
        print("STATUS:", response.status_code)
        print("TEXT:", response.text)
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)

@router.post("/")
async def create_book(request: Request):
    book_data = await request.json()
    async with httpx.AsyncClient(follow_redirects=True) as client:
        response = await client.post(BOOK_SERVICE_URL, json=book_data)
        print("STATUS:", response.status_code)
        print("TEXT:", response.text)
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(response.status_code, response.text)

@router.get("/{book_id}")
async def get_book(book_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BOOK_SERVICE_URL}/{book_id}")
        print("STATUS:", response.status_code)
        print("TEXT:", response.text)
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(response.status_code, response.text)

@router.delete("/{book_id}")
async def delete_book(book_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.delete(f"{BOOK_SERVICE_URL}/{book_id}")
        print("STATUS:", response.status_code)
        print("TEXT:", response.text)
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(response.status_code, response.text)

@router.post("/admin/add")
async def admin_add_book(
    title: str = Form(...),
    author: str = Form(...),
    genre: str = Form(...),
    description: str = Form(''),
    year: int = Form(...),
    cover_url: str = Form(''),
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Тільки для адмінов")
    # Відправляємо multipart/form-data на book_service
    data = {
        "title": title,
        "author": author,
        "genre": genre,
        "description": description,
        "year": str(year),
        "cover_url": cover_url,
    }
    file_bytes = await file.read()
    files = {
        "file": (file.filename, file_bytes, file.content_type)
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(f"{BOOK_SERVICE_URL}/upload", data=data, files=files)
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)

@router.get("/{book_id}/content")
async def get_book_content(book_id: int):
    import httpx
    BOOK_SERVICE_URL = "http://localhost:8002/books"
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BOOK_SERVICE_URL}/{book_id}/content")
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(response.status_code, response.text)
