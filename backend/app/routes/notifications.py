from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.utils.notifications import send_bulk_notification, send_single_notification
from app.api.v1.auth import verify_token, require_roles
from app.core.roles import UserRole

router = APIRouter(prefix="/notifications", tags=["Notifications"], dependencies=[Depends(require_roles(UserRole.ADMIN))])

class BroadcastRequest(BaseModel):
    event_type: str
    title: str
    message: str
    recipient_roles: Optional[List[str]] = None
    recipient_emails: Optional[List[str]] = None
    delivery_modes: List[str] = ["email", "sms", "whatsapp"]
    department: Optional[str] = None
    api_key: Optional[str] = None
    module_name: Optional[str] = None

@router.post("/broadcast")
def broadcast_notification(data: BroadcastRequest):
    """
    General endpoint to send notifications (Bulk or Single) from the ERP modules.
    """
    try:
        if data.recipient_emails:
            # Single/Specific User Mode
            result = send_single_notification(
                event_type=data.event_type,
                title=data.title,
                message=data.message,
                recipient_emails=data.recipient_emails,
                delivery_modes=data.delivery_modes,
                api_key=data.api_key,
                module_name=data.module_name
            )
        else:
            # Bulk Role Mode
            result = send_bulk_notification(
                event_type=data.event_type,
                title=data.title,
                message=data.message,
                recipient_roles=data.recipient_roles or ["student"],
                delivery_modes=data.delivery_modes,
                department=data.department,
                api_key=data.api_key,
                module_name=data.module_name
            )
            
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return {"message": "Notification sent successfully", "response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
