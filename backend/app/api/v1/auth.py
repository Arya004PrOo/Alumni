from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
import requests
from dotenv import load_dotenv
from app.core.roles import UserRole

load_dotenv()

router = APIRouter(tags=["Authentication"])

security_scheme = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "shared-secret-key-123")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
AUTH_API_URL = os.getenv("AUTH_API_URL")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
    token = credentials.credentials
    
    # 1. Attempt remote verification if AUTH_API_URL is configured
    if AUTH_API_URL:
        try:
            url = f"{AUTH_API_URL.rstrip('/')}/api/auth/verify"
            response = requests.post(
                url,
                json={"token": token},
                headers={"Content-Type": "application/json", "ngrok-skip-browser-warning": "69420"},
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("valid"):
                    payload = data.get("payload") or {}
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
        except Exception as e:
            print(f"Remote verification failed: {e}. Falling back to local verification.")

    # 2. Fallback to local JWT verification
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id") or payload.get("id") or payload.get("sub")
        email = payload.get("email")
        role = payload.get("role")
        if not user_id or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing user_id or role"
            )
        return {
            "user_id": user_id,
            "email": email,
            "role": role,
            "full_name": payload.get("full_name") or payload.get("username")
        }
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
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
