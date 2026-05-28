import requests
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

security_scheme = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "shared-secret-key-123")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
AUTH_API_URL = os.getenv("AUTH_API_URL")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
    token = credentials.credentials
    
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
                    payload = data.get("payload")
                    print(f"JWT AUTH VERIFY SUCCESS (Remote): Payload={payload}")
                    return payload
            
            detail_msg = "Invalid token"
            try:
                detail_msg = response.json().get("detail", "Invalid token")
            except:
                pass
            raise HTTPException(status_code=401, detail=f"Invalid authentication token: {detail_msg}")
        except requests.RequestException as e:
            print(f"Auth backend connection failed: {e}. Falling back to local verification.")
            
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        print(f"JWT VERIFY SUCCESS (Local): Payload={payload}")
        return payload
    except jwt.PyJWTError as e:
        print(f"JWT VERIFY ERROR (Local): Token={token}... Error={str(e)}")
        try:
            unverified = jwt.decode(token, options={"verify_signature": False})
            print(f"JWT UNVERIFIED PAYLOAD: {unverified}")
        except Exception as err:
            print(f"JWT DECODE FAILED: {str(err)}")
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {str(e)}")