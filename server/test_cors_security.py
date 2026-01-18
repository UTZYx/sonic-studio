import sys
import os
from unittest.mock import MagicMock

# 1. Mock heavy/missing dependencies
sys.modules["torch"] = MagicMock()
sys.modules["audiocraft"] = MagicMock()
sys.modules["audiocraft.models"] = MagicMock()
sys.modules["torchaudio"] = MagicMock()
sys.modules["scipy"] = MagicMock()
sys.modules["scipy.io"] = MagicMock()
sys.modules["scipy.io.wavfile"] = MagicMock()

# 2. Add current directory to path so we can import neural_bridge
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
# Import app after mocking
from neural_bridge import app

client = TestClient(app)

def test_cors_secure():
    """
    Verifies that the configuration denies unauthorized origins
    and allows authorized ones.
    """
    # 1. Test Unauthorized Origin
    print("Testing CORS with Origin: http://evil.com (Should be BLOCKED)")
    response = client.options(
        "/generate",
        headers={
            "Origin": "http://evil.com",
            "Access-Control-Request-Method": "POST"
        }
    )

    allow_origin = response.headers.get("access-control-allow-origin")
    print(f"Access-Control-Allow-Origin: {allow_origin}")

    if allow_origin in ["*", "http://evil.com"]:
        raise AssertionError(f"VULNERABILITY DETECTED: Origin '{allow_origin}' is still allowed!")

    print("SUCCESS: http://evil.com was blocked (no Allow-Origin header or not matched).")

    # 2. Test Authorized Origin (Default: http://localhost:3000)
    print("\nTesting CORS with Origin: http://localhost:3000 (Should be ALLOWED)")
    response_ok = client.options(
        "/generate",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST"
        }
    )

    allow_origin_ok = response_ok.headers.get("access-control-allow-origin")
    print(f"Access-Control-Allow-Origin: {allow_origin_ok}")

    assert allow_origin_ok == "http://localhost:3000", f"Expected 'http://localhost:3000', got '{allow_origin_ok}'"
    print("SUCCESS: http://localhost:3000 was allowed.")

if __name__ == "__main__":
    try:
        test_cors_secure()
        print("\nTest PASSED (Security Fix Verified)")
    except AssertionError as e:
        print(f"Test FAILED (Vulnerability NOT Reproduced): {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Test ERROR: {e}")
        sys.exit(1)
