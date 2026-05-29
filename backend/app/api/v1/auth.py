import os

import jwt
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.roles import UserRole

load_dotenv()

router = APIRouter(tags=["Authentication"])

security_scheme = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "shared-secret-key-123")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
AUTH_API_URL = os.getenv("AUTH_API_URL")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
    token = credentials.credentials

    # 1. First, attempt local JWT signature verification using the JWT_SECRET
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id") or payload.get("id") or payload.get("sub")
        email = payload.get("email")
        role = payload.get("role")
        if user_id and role:
            return {
                "user_id": user_id,
                "email": email,
                "role": role,
                "full_name": payload.get("full_name") or payload.get("username")
            }
    except jwt.PyJWTError as e:
        print(f"Local JWT signature verification failed: {e}. Trying fallback remote verification.")

    # 2. Fallback: GET request to Central Auth module's /api/v1/auth/me endpoint
    auth_backend_url = os.getenv("AUTH_BACKEND_URL") or os.getenv("AUTH_API_URL")
    if auth_backend_url:
        try:
            url = f"{auth_backend_url.rstrip('/')}/api/v1/auth/me"
            response = requests.get(
                url,
                headers={
                    "Authorization": f"Bearer {token}",
                    "ngrok-skip-browser-warning": "69420"
                },
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                # Resolve wrapped 'payload' or direct fields
                payload = data.get("payload") if isinstance(data.get("payload"), dict) else data

                user_id = payload.get("user_id") or payload.get("id") or payload.get("sub")
                email = payload.get("email")
                role = payload.get("role")
                full_name = payload.get("full_name") or payload.get("username")

                if user_id and role:
                    return {
                        "user_id": user_id,
                        "email": email,
                        "role": role,
                        "full_name": full_name
                    }
        except Exception as exc:
            print(f"Fallback remote verification request failed: {exc}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token or session expired"
    )

def require_roles(*allowed_roles: UserRole):
    def dependency(current_user: dict = Depends(verify_token)):
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: user role '{user_role}' is not authorized. Required: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return dependency

@router.get("/auth/me")
def get_me(current_user: dict = Depends(verify_token)):
    return current_user
