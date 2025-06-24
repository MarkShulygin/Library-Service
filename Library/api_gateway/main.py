from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
import httpx # type: ignore
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .dependencies import get_token
import requests
from .dependencies import get_current_user
from api_gateway.routes import book_routes
from api_gateway.routes import reading_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

USER_SERVICE_URL = "http://localhost:8001"

@app.post("/users/register")
async def register(request: Request):
    data = await request.json()
    res = requests.post(f"{USER_SERVICE_URL}/users/register", json=data)
    print(res.text)
    return res.json()

@app.post("/users/login")
def login(user: dict):
    res = requests.post("http://localhost:8001/users/login", json=user)
    print("Status code:", res.status_code)
    print("Response text:", res.text)
    try:
        return res.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON: {str(e)}; Body: {res.text}")
    
@router.get("/users/me")
async def get_current_user(request: Request):
    token = request.headers.get("authorization")
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{USER_SERVICE_URL}/users/me",
            headers={"Authorization": token} if token else {}
        )
    return JSONResponse(content=response.json(), status_code=response.status_code)

app.include_router(router)
app.include_router(book_routes.router, prefix="/books", tags=["Books"])
app.include_router(reading_routes.router)