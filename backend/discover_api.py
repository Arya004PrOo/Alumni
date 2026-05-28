import requests
import json

url = "https://tapering-gradation-quickness.ngrok-free.dev/openapi.json"
try:
    r = requests.get(url)
    data = r.json()
    paths = data.get("paths", {})
    print("Available POST paths:")
    for path, methods in paths.items():
        if "post" in methods:
            print(f"- {path}")
except Exception as e:
    print(f"Error: {e}")
