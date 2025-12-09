import http.client
import json
import random

# Reuse auth flow logic to get a token
random_id = random.randint(1000, 9999)
email = f"exec_tester{random_id}@example.com"
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

# 2. Check Default Integrations
print("\n--- Check Default Integrations ---")
status, raw_data = make_request("GET", "/user/integrations/", headers=auth_headers)
print(f"Status: {status}")
print(f"Response: {raw_data}")

integrations = json.loads(raw_data)
if integrations.get("google_calendar") is not False:
    print("Expected google_calendar to be False by default")
    exit(1)

# 3. Enable Integration
print("\n--- Enable Integration (Notion) ---")
update_data = json.dumps({"notion": True})
status, raw_data = make_request("PATCH", "/user/integrations/", update_data, auth_headers)
print(f"Status: {status}")
print(f"Response: {raw_data}")

updated_integrations = json.loads(raw_data)
if updated_integrations.get("notion") is not True:
    print("Expected notion to be True after update")
    exit(1)
    
# 4. Create Dummy Action Item
print("\n--- Create Dummy Action Item ---")
# Need a meeting ID? Actually we can create an action item without a meeting ID based on the model (Optional), 
# but usually it's tied. Let's create one directly.
# Wait, `meeting_id` is optional in `ActionItemBase`.
item_data = json.dumps({
    "description": "Test execution item",
    "action_type": "Task"
})
status, raw_data = make_request("POST", "/action-items/", item_data, auth_headers)
print(f"Status: {status}")
print(f"Response: {raw_data}")

if status != 200:
    print("Failed to create action item")
    exit(1)

item_id = json.loads(raw_data)["_id"]

# 5. Execute Action Item
print(f"\n--- Execute Action Item ({item_id}) ---")
status, raw_data = make_request("POST", f"/action-items/{item_id}/execute", headers=auth_headers)
print(f"Status: {status}")
print(f"Response: {raw_data}")

if status != 200:
    print("Execution failed")
    exit(1)

if json.loads(raw_data)["status"] != "executed":
    print("Unexpected response status")
    exit(1)

# Verify status update via GET
status, raw_data = make_request("GET", "/action-items/?status=Executed", headers=auth_headers)
items = json.loads(raw_data)
# We might have other executed items if we reused user, but this is a fresh random user.
found = False
for item in items:
    if item["_id"] == item_id:
        found = True
        if item["status"] != "Executed":
             print(f"Item status mismatch: {item['status']}")
             exit(1)
        break

if not found:
    print("Executed item not found in list")
    exit(1)

print("\n--- Execution & Integration Flow Verification Successful ---")