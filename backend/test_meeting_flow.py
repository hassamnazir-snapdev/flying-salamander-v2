import http.client
import json
import random

# Reuse auth flow logic to get a token
random_id = random.randint(1000, 9999)
email = f"meeting_tester{random_id}@example.com"
password = "password123"

headers = {'Content-type': 'application/json'}

def make_request(method, path, body=None, headers=None):
    conn = http.client.HTTPConnection("localhost", 8000)
    try:
        conn.request(method, path, body, headers or {})
        response = conn.getresponse()
        data = response.read().decode()
        return response.status, data
    except ConnectionRefusedError:
        print("Connection refused. Is the server running?")
        exit(1)
    finally:
        conn.close()

# 1. Signup & Login to get token
print(f"--- Signup & Login ({email}) ---")
user_data = json.dumps({"email": email, "password": password})
status, _ = make_request("POST", "/auth/signup", user_data, headers)
if status not in (201, 400): # 400 if user exists from previous failed run
    print(f"Signup failed with status {status}")
    exit(1)

status, raw_data = make_request("POST", "/auth/login", user_data, headers)
if status != 200:
    print(f"Login failed with status {status}")
    exit(1)

token = json.loads(raw_data).get('access_token')
auth_headers = {'Authorization': f'Bearer {token}', 'Content-type': 'application/json'}
print("Login successful, token acquired.")

# 2. Sync Meetings
print("\n--- Sync Meetings ---")
status, raw_data = make_request("POST", "/meetings/sync", headers=auth_headers)
print(f"Status: {status}")
print(f"Response: {raw_data}")

if status != 200:
    print("Sync failed")
    exit(1)

# 3. Get Meetings
print("\n--- Get Meetings ---")
status, raw_data = make_request("GET", "/meetings/", headers=auth_headers)
print(f"Status: {status}")
meetings = json.loads(raw_data)
print(f"Retrieved {len(meetings)} meetings")

if not meetings:
    print("No meetings found after sync!")
    exit(1)

first_meeting_id = meetings[0]['_id']
print(f"First Meeting ID: {first_meeting_id}")
print(f"First Meeting Status: {meetings[0]['status']}")

# 4. Update Meeting Status
print(f"\n--- Update Meeting Status ({first_meeting_id}) ---")
update_data = json.dumps({"status": "completed"})
status, raw_data = make_request("PATCH", f"/meetings/{first_meeting_id}/status", update_data, auth_headers)
print(f"Status: {status}")
print(f"Response: {raw_data}")

updated_meeting = json.loads(raw_data)
if updated_meeting['status'] != 'completed':
    print("Status update failed!")
    exit(1)

print("\n--- Meeting Flow Verification Successful ---")