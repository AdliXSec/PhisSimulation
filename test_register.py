import requests

url = "http://localhost:8000/api/v1/auth/register"
data = {
    "username": "testuser_verify",
    "email": "test_verify@example.com",
    "password": "Password123!",
    "full_name": "Test User"
}

response = requests.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
