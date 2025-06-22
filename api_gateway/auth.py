# api_gateway/auth.py
from jose import JWTError, jwt

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

def verify_jwt_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: str = payload.get("id")
        if email is None or role is None or user_id is None:
            raise ValueError("Invalid token payload")
        return {"email": email, "role": role, "id": user_id}
    except JWTError:
        raise ValueError("Could not validate token")
