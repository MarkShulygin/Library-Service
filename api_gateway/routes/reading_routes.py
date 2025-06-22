# api_gateway/routes/reading_routes.py

from fastapi import APIRouter, Body, Request, HTTPException, Depends
from api_gateway.dependencies import get_current_user
import httpx

router = APIRouter(prefix="/reading", tags=["Reading"])

READING_SERVICE_URL = "http://localhost:8003/reading"  # Замінити, якщо сервіс працює на іншому порту

@router.post("/start")
async def start_reading(request: Request, user=Depends(get_current_user)):
    """
    Почати читання книги — створити або оновити прогрес.
    Очікує JSON: {"book_id": int, "page": int}
    """
    data = await request.json()
    user_id = user.get("id") if isinstance(user, dict) else getattr(user, "id", None)
    if not user_id:
        raise HTTPException(401, "User ID not found")

    data["user_id"] = user_id
    print("Sending to reading service:", data)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{READING_SERVICE_URL}/start", json=data)
    if response.status_code != 200:
        raise HTTPException(response.status_code, response.text)
    return response.json()

@router.post("/stop")
async def stop_reading(request: Request, user=Depends(get_current_user)):
    """
    Завершити читання книги — оновити статус прогресу (наприклад, завершено).
    Очікує JSON: {"book_id": int, "page": int}
    """
    data = await request.json()
    data["user_id"] = getattr(user, "id", user.get("id") if isinstance(user, dict) else None)


    async with httpx.AsyncClient() as client:
        response = await client.post(f"{READING_SERVICE_URL}/stop", json=data)
    if response.status_code != 200:
        raise HTTPException(response.status_code, response.text)
    return response.json()

@router.get("/progress/{book_id}")
async def get_progress(book_id: int, user=Depends(get_current_user)):
    """
    Отримати прогрес користувача по конкретній книзі.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{READING_SERVICE_URL}/progress/{book_id}", params={"user_id": user.get("id") or user.get("user_id")})
    if response.status_code != 200:
        raise HTTPException(response.status_code, response.text)
    return response.json()

@router.get("/progress")
async def get_all_progress(user=Depends(get_current_user)):
    """
    Отримати прогрес користувача по всіх книгах.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{READING_SERVICE_URL}/progress", params={"user_id": user.get("id") or user.get("user_id")})
    if response.status_code != 200:
        raise HTTPException(response.status_code, response.text)
    return response.json()
