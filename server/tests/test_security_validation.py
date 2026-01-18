import sys
import os
from unittest.mock import MagicMock

# Mock dependencies BEFORE importing the module
sys.modules["torch"] = MagicMock()
sys.modules["uvicorn"] = MagicMock()
sys.modules["fastapi"] = MagicMock()
sys.modules["fastapi.middleware.cors"] = MagicMock()
sys.modules["fastapi.responses"] = MagicMock()
sys.modules["audiocraft"] = MagicMock()
sys.modules["audiocraft.models"] = MagicMock()
sys.modules["torchaudio"] = MagicMock()
sys.modules["scipy"] = MagicMock()
sys.modules["scipy.io"] = MagicMock()
sys.modules["scipy.io.wavfile"] = MagicMock()

# Import the module to test
# Adjust path to find server.neural_bridge
# Assuming this script is in server/tests/ and we want to import server.neural_bridge
# We need to add the parent of 'server' to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
repo_root = os.path.abspath(os.path.join(current_dir, "../../"))
sys.path.append(repo_root)

from server.neural_bridge import GenerationRequest
from pydantic import ValidationError

def test_vulnerability():
    print("Testing GenerationRequest validation...")
    try:
        # Try a huge duration
        req = GenerationRequest(prompt="test", duration=1000, top_k=5000)
        print("VULNERABLE: GenerationRequest accepted huge duration (1000) and top_k (5000).")
        sys.exit(1) # Fail the test
    except ValidationError as e:
        print("SECURE: GenerationRequest rejected invalid input.")
        # print(e)
        sys.exit(0) # Pass the test
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_vulnerability()
