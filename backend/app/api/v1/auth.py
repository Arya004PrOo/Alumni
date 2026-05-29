from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(tags=["Authentication"])

security_scheme = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "shared-secret-key-123")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
    token = credentials.credentials
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

@router.get("/auth/me")
def get_me(current_user: dict = Depends(verify_token)):
    return current_user
