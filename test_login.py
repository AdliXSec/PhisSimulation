import requests

try:
    r = requests.post('http://localhost:8000/api/v1/auth/login', json={'username': 'admin', 'password': 'admin123'})
    print('Status 8000:', r.status_code)
    print('Body 8000:', r.text)
except Exception as e:
    print('Error 8000:', e)

try:
    r = requests.post('http://127.0.0.1:8001/api/v1/auth/login', json={'username': 'admin', 'password': 'admin123'})
    print('Status 8001:', r.status_code)
    print('Body 8001:', r.text)
except Exception as e:
    print('Error 8001:', e)
