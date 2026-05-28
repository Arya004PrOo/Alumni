import requests

url = "https://tapering-gradation-quickness.ngrok-free.dev/api/module-notification"

payload = {
    "api_key": "ALUMNI_KEY_2026",
    "module_name": "Alumni Module",
    "event_type": "Low Attendance Alert",
    "title": "Attendance Warning",
    "message": "Your attendance is below 75%",
    "recipient_roles": ["student"],
    "delivery_modes": ["email", "sms", "whatsapp"],
    "department": "BSc CS"
}

print(f"Sending test payload to {url}...")
try:
    response = requests.post(url, json=payload, timeout=10)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(response.json())
except Exception as e:
    print(f"Error occurred: {e}")
