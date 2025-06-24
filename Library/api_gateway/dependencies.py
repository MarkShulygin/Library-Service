# api_gateway/dependencies.py
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from user_service.models import User
from .auth import verify_jwt_token

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = verify_jwt_token(token)
        print("USER:", User)
        return payload
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

async def get_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return credentials.credentials 