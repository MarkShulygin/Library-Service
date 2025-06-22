from http.client import HTTPException
from fastapi import APIRouter, Request
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
