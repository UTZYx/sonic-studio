import sys
from unittest.mock import MagicMock
import os

# --- MOCKING DEPENDENCIES ---
# We must mock these BEFORE importing neural_bridge
sys.modules["torch"] = MagicMock()
sys.modules["uvicorn"] = MagicMock()
sys.modules["audiocraft"] = MagicMock()
sys.modules["audiocraft.models"] = MagicMock()
sys.modules["torchaudio"] = MagicMock()
sys.modules["scipy"] = MagicMock()
sys.modules["scipy.io"] = MagicMock()
sys.modules["scipy.io.wavfile"] = MagicMock()

# Now we can import the app
# We need to add the server directory to path so we can import neural_bridge
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from neural_bridge import app, manager

from fastapi.testclient import TestClient
import unittest

client = TestClient(app, raise_server_exceptions=False)

class SecurityTests(unittest.TestCase):

    def test_input_validation_prompt_length(self):
        """Test that prompts > 1000 chars are rejected."""
        long_prompt = "a" * 1001
        payload = {
            "prompt": long_prompt,
            "type": "music",
            "duration": 10
        }
        response = client.post("/generate", json=payload)
        if response.status_code != 422:
             print(f"FAILURE: Accepted prompt > 1000 chars. Status: {response.status_code}")
        self.assertEqual(response.status_code, 422, f"Should reject long prompt. Got {response.status_code}")

    def test_input_validation_duration(self):
        """Test that duration > 120 is rejected."""
        payload = {
            "prompt": "test",
            "type": "music",
            "duration": 121
        }
        response = client.post("/generate", json=payload)
        if response.status_code != 422:
             print(f"FAILURE: Accepted duration > 120. Status: {response.status_code}")
        self.assertEqual(response.status_code, 422, f"Should reject duration > 120. Got {response.status_code}")

    def test_input_validation_type(self):
        """Test that invalid type is rejected."""
        payload = {
            "prompt": "test",
            "type": "invalid_type",
            "duration": 10
        }
        response = client.post("/generate", json=payload)
        if response.status_code != 422:
             print(f"FAILURE: Accepted invalid type. Status: {response.status_code}")
        self.assertEqual(response.status_code, 422, f"Should reject invalid type. Got {response.status_code}")

    def test_exception_handling_no_leak(self):
        """Test that internal errors do not leak stack traces."""
        # Mock the manager to raise an exception
        original_get_model = manager.get_model
        manager.get_model = MagicMock(side_effect=Exception("SENSITIVE_DB_INFO_LEAKED"))

        try:
            payload = {
                "prompt": "test",
                "type": "music",
                "duration": 10
            }
            response = client.post("/generate", json=payload)

            self.assertEqual(response.status_code, 500, "Should return 500 on internal error")

            # Check content
            try:
                detail = response.json().get("detail", "")
            except:
                detail = response.text

            print(f"Error Detail: {detail}")

            self.assertNotIn("SENSITIVE_DB_INFO_LEAKED", detail, "Should NOT leak exception details")
            self.assertEqual(detail, "Internal Generation Error", "Should return generic error message")

        finally:
            manager.get_model = original_get_model

if __name__ == "__main__":
    unittest.main()
