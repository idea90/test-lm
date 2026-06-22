import subprocess
import time
import urllib.request
import urllib.error
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

print("=== Starting Flask Server integration test ===")
# Start app.py in background
server_process = subprocess.Popen([sys.executable, 'app.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
time.sleep(3) # Wait for Flask server to boot up

# Enable cookie handling
cookie_processor = urllib.request.HTTPCookieProcessor()
opener = urllib.request.build_opener(cookie_processor)
urllib.request.install_opener(opener)

BASE_URL = "http://127.0.0.1:5000"

def make_request(path, data=None, method='GET'):
    url = f"{BASE_URL}{path}"
    req_data = json.dumps(data).encode('utf-8') if data else None
    headers = {'Content-Type': 'application/json'} if data else {}
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode('utf-8'))
        except Exception:
            return e.code, None

success = True

try:
    # 1. Test fetching protected endpoint without authentication
    print("Testing GET /api/sources (unauthenticated)...")
    status, body = make_request("/api/sources")
    print(f"Status: {status}, Body: {body}")
    if status != 401 or not body.get('auth_required'):
        print("[FAIL] Fetching sources without login should return 401 Unauthorized")
        success = False
    else:
        print("[OK] Correctly blocked unauthenticated request")

    # 2. Test Guest Login
    print("\nTesting POST /api/auth/guest...")
    status, body = make_request("/api/auth/guest", data={}, method='POST')
    print(f"Status: {status}, Body: {body}")
    if status != 200 or body.get('username') != 'guest' or not body.get('is_guest'):
        print("[FAIL] Guest login failed")
        success = False
    else:
        print("[OK] Guest login successful")

    # 3. Test fetching protected endpoint with guest auth session cookie
    print("\nTesting GET /api/sources (guest authenticated)...")
    status, body = make_request("/api/sources")
    print(f"Status: {status}, Body: {body}")
    if status != 200 or not isinstance(body, list):
        print("[FAIL] Fetching sources with guest session failed")
        success = False
    else:
        print("[OK] Fetching sources with guest session successful")

    # 4. Test logout
    print("\nTesting POST /api/auth/logout...")
    status, body = make_request("/api/auth/logout", data={}, method='POST')
    print(f"Status: {status}, Body: {body}")
    if status != 200:
        print("[FAIL] Logout failed")
        success = False
    else:
        print("[OK] Logout successful")

    # 5. Test protected endpoint after logout
    print("\nTesting GET /api/sources (after logout)...")
    status, body = make_request("/api/sources")
    print(f"Status: {status}, Body: {body}")
    if status != 401:
        print("[FAIL] Access was not blocked after logout")
        success = False
    else:
        print("[OK] Correctly blocked request after logout")

    # 6. Test Registering custom user
    print("\nTesting POST /api/auth/register...")
    test_username = f"teacher_{int(time.time())}"
    status, body = make_request("/api/auth/register", data={"username": test_username, "password": "securepassword"}, method='POST')
    print(f"Status: {status}, Body: {body}")
    if status != 200 or body.get('username') != test_username:
        print("[FAIL] Registration failed")
        success = False
    else:
        print("[OK] Registration successful")

    # 7. Test Registering existing user (should fail)
    print("\nTesting POST /api/auth/register (duplicate user)...")
    status, body = make_request("/api/auth/register", data={"username": test_username, "password": "securepassword"}, method='POST')
    print(f"Status: {status}, Body: {body}")
    if status != 400:
        print("[FAIL] Registration of existing user should fail with 400")
        success = False
    else:
        print("[OK] Registration of duplicate user correctly blocked")

    # 8. Test logging in with newly registered user
    print("\nTesting POST /api/auth/login...")
    # Clear cookies by creating a new opener to simulate a clean browser session
    cookie_processor = urllib.request.HTTPCookieProcessor()
    opener = urllib.request.build_opener(cookie_processor)
    urllib.request.install_opener(opener)
    
    status, body = make_request("/api/auth/login", data={"username": test_username, "password": "securepassword"}, method='POST')
    print(f"Status: {status}, Body: {body}")
    if status != 200 or body.get('username') != test_username or body.get('is_guest'):
        print("[FAIL] Login failed")
        success = False
    else:
        print("[OK] Login successful")

    # 9. Test protected endpoint after login
    print("\nTesting GET /api/sources (user authenticated)...")
    status, body = make_request("/api/sources")
    print(f"Status: {status}, Body: {body}")
    if status != 200 or not isinstance(body, list):
        print("[FAIL] Fetching sources with user session failed")
        success = False
    else:
        print("[OK] Fetching sources with user session successful")

except Exception as e:
    print(f"[FAIL] Unexpected integration test error: {e}")
    success = False
finally:
    # Shutdown server
    print("\nShutting down Flask server subprocess...")
    server_process.terminate()
    try:
        server_process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        server_process.kill()
    print("Flask server subprocess terminated.")

if success:
    print("\n=== ALL AUTHENTICATION INTEGRATION TESTS PASSED ===")
    sys.exit(0)
else:
    print("\n=== INTEGRATION TESTS FAILED ===")
    sys.exit(1)
