import requests

url = "https://tapering-gradation-quickness.ngrok-free.dev/api/module-notification"

payload = {
    "api_key": "ADMISS_KEY_2026",
    "module_name": "Admission and Enrollment",
    "event_type": "Fee Reminder",
    "title": "Overdue Fees",
    "message": "Your tuition fee is 5 days overdue. Please pay immediately.",
    "recipient_emails": ["ainapurearya04@example.com"],
    "delivery_modes": ["email"]
}

print(f"Sending Admission payload to {url}...")
try:
    response = requests.post(url, json=payload, headers={"ngrok-skip-browser-warning": "true"}, timeout=10)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(response.json())
except Exception as e:
    print(f"Error occurred: {e}")
