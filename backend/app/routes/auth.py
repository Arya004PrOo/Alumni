from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET", "shared-secret-key-123")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

@router.get("/me")
def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Extract user profile information
        user_id = payload.get("sub") or payload.get("id") or payload.get("user_id")
        email = payload.get("email")
        role = payload.get("role")
        full_name = payload.get("full_name") or payload.get("name")
        
        if not user_id or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing identity or role fields"
            )
            
        return {
            "user_id": user_id,
            "email": email,
            "role": role.lower() if isinstance(role, str) else role,
            "full_name": full_name
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
