import sys
import os
from unittest.mock import MagicMock

# --- MOCKING ---
# Mock heavy dependencies before they are imported by neural_bridge
sys.modules["torch"] = MagicMock()
sys.modules["uvicorn"] = MagicMock()
sys.modules["audiocraft"] = MagicMock()
sys.modules["audiocraft.models"] = MagicMock()
sys.modules["torchaudio"] = MagicMock()
sys.modules["scipy"] = MagicMock()
sys.modules["scipy.io"] = MagicMock()
sys.modules["scipy.io.wavfile"] = MagicMock()

# Setup path to import neural_bridge
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from neural_bridge import app
except ImportError as e:
    print(f"Failed to import neural_bridge: {e}")
    sys.exit(1)

from fastapi.testclient import TestClient

client = TestClient(app)

def test_validation_security():
    print("--- Running Security Validation Tests ---")
    failures = []

    # 1. Test Excessive Duration (DoS Risk)
    print("Testing Duration Limit (>120s)...")
    res = client.post("/generate", json={
        "prompt": "test",
        "duration": 9999
    })
    if res.status_code != 422:
        failures.append(f"Duration limit failed. Got {res.status_code}, expected 422")
    else:
        print("✅ Duration limit enforced.")

    # 2. Test Huge Prompt (DoS Risk)
    print("Testing Prompt Limit (>1000 chars)...")
    res = client.post("/generate", json={
        "prompt": "a" * 2000,
        "duration": 5
    })
    if res.status_code != 422:
        failures.append(f"Prompt limit failed. Got {res.status_code}, expected 422")
    else:
        print("✅ Prompt limit enforced.")

    # 3. Test Negative Temperature (Logic Error)
    print("Testing Negative Temperature...")
    res = client.post("/generate", json={
        "prompt": "test",
        "temperature": -1.0
    })
    if res.status_code != 422:
        failures.append(f"Temperature limit failed. Got {res.status_code}, expected 422")
    else:
        print("✅ Temperature limit enforced.")

    if failures:
        print("\n❌ SECURITY TESTS FAILED:")
        for f in failures:
            print(f" - {f}")
        sys.exit(1)
    else:
        print("\n✅ ALL SECURITY TESTS PASSED")
        sys.exit(0)

if __name__ == "__main__":
    test_validation_security()
