import requests
from typing import List, Optional

NOTIFICATION_URL = "https://tapering-gradation-quickness.ngrok-free.dev/api/module-notification"
API_KEY = "ALUMNI_KEY_2026"
MODULE_NAME = "Alumni Module"

# Some Ngrok tunnels require this header to skip the "interstitial" warning page
NGROK_HEADERS = {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json"
}

def send_bulk_notification(
    event_type: str,
    title: str,
    message: str,
    recipient_roles: List[str] = ["student"],
    delivery_modes: List[str] = ["email", "sms", "whatsapp"],
    department: Optional[str] = None,
    api_key: Optional[str] = None,
    module_name: Optional[str] = None
):
    """
    Sends bulk notifications to entire roles/departments.
    """
    payload = {
        "api_key": api_key or API_KEY,
        "module_name": module_name or MODULE_NAME,
        "event_type": event_type,
        "title": title,
        "message": message,
        "recipient_roles": recipient_roles,
        "delivery_modes": delivery_modes
    }
    if department:
        payload["department"] = department

    try:
        print(f"DEBUG: Sending Bulk Notification Payload: {payload}")
        response = requests.post(
            NOTIFICATION_URL, 
            json=payload, 
            headers=NGROK_HEADERS,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        return {"error": "The notification service (Ngrok) is taking too long to respond. Please check if the tunnel is active."}
    except requests.exceptions.RequestException as e:
        return {"error": f"Connection Error: {str(e)}"}
    except Exception as e:
        return {"error": str(e)}

def send_single_notification(
    event_type: str,
    title: str,
    message: str,
    recipient_emails: List[str],
    delivery_modes: List[str] = ["email", "sms", "whatsapp"],
    api_key: Optional[str] = None,
    module_name: Optional[str] = None
):
    """
    Sends notification to specific users.
    """
    payload = {
        "api_key": api_key or API_KEY,
        "module_name": module_name or MODULE_NAME,
        "event_type": event_type,
        "title": title,
        "message": message,
        "recipient_emails": recipient_emails,
        "delivery_modes": delivery_modes
    }

    try:
        print(f"DEBUG: Sending Single Notification Payload: {payload}")
        response = requests.post(
            NOTIFICATION_URL, 
            json=payload, 
            headers=NGROK_HEADERS,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        return {"error": "The notification service (Ngrok) is taking too long to respond. Please check if the tunnel is active."}
    except requests.exceptions.RequestException as e:
        return {"error": f"Connection Error: {str(e)}"}
    except Exception as e:
        return {"error": str(e)}
