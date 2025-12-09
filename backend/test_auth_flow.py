import http.client
import json
import random

# Generate a random email to ensure uniqueness for repeated runs
random_id = random.randint(1000, 9999)
email = f"test{random_id}@example.com"
password = "password123"

headers = {'Content-type': 'application/json'}

def make_request(method, path, body=None, headers=None):
    conn = http.client.HTTPConnection("localhost", 8000)
    try:
        conn.request(method, path, body, headers or {})
        response = conn.getresponse()
        data = response.read().decode()
        return response.status, data
    finally:
        conn.close()

# 1. Signup
print(f"--- Signup ({email}) ---")
user_data = json.dumps({"email": email, "password": password})
status, data = make_request("POST", "/auth/signup", user_data, headers)
print(f"Status: {status}")
print(f"Data: {data}")

if status != 201:
    print("Signup failed")
    if status != 400:
        exit(1)

# 2. Login
print("\n--- Login ---")
status, raw_data = make_request("POST", "/auth/login", user_data, headers)
print(f"Status: {status}")
try:
    data = json.loads(raw_data)
except json.JSONDecodeError:
    print(f"Failed to decode JSON: {raw_data}")
    exit(1)

print(f"Token present: {'access_token' in data}")
token = data.get('access_token')

if not token:
    print("Failed to get token")
    exit(1)

# 3. Verify /me
print("\n--- Verify /me ---")
auth_headers = {'Authorization': f'Bearer {token}'}
status, data = make_request("GET", "/auth/me", headers=auth_headers)
print(f"Status: {status}")
print(f"Data: {data}")