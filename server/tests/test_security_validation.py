import sys
import unittest
from unittest.mock import MagicMock
import os

# --- MOCK DEPENDENCIES ---
# Mock heavy ML libraries to allow testing validation logic without GPU/installation
sys.modules["torch"] = MagicMock()
sys.modules["audiocraft"] = MagicMock()
sys.modules["audiocraft.models"] = MagicMock()
sys.modules["torchaudio"] = MagicMock()
sys.modules["scipy"] = MagicMock()
sys.modules["scipy.io"] = MagicMock()
sys.modules["scipy.io.wavfile"] = MagicMock()

# --- PATH SETUP ---
# Add server directory to path to allow importing neural_bridge
current_dir = os.path.dirname(os.path.abspath(__file__))
server_dir = os.path.dirname(current_dir)
if server_dir not in sys.path:
    sys.path.append(server_dir)

try:
    from neural_bridge import GenerationRequest, LayerConfig
    from pydantic import ValidationError
except ImportError as e:
    print(f"Failed to import neural_bridge: {e}")
    sys.exit(1)

class TestSecurityValidation(unittest.TestCase):
    """
    Security regression tests for input validation.
    Ensures that the API rejects malformed or malicious inputs.
    """

    def test_duration_constraints(self):
        """Test duration bounds (DoS prevention)."""
        # Negative duration
        with self.assertRaises(ValidationError):
            GenerationRequest(prompt="test", duration=-1)

        # Duration too long (resource exhaustion)
        with self.assertRaises(ValidationError):
            GenerationRequest(prompt="test", duration=1000)

        # Valid duration
        req = GenerationRequest(prompt="test", duration=60)
        self.assertEqual(req.duration, 60)

    def test_top_k_constraints(self):
        """Test top_k bounds (compute limit)."""
        # Too high
        with self.assertRaises(ValidationError):
            GenerationRequest(prompt="test", top_k=5000)

    def test_temperature_constraints(self):
        """Test temperature bounds."""
        # Too high
        with self.assertRaises(ValidationError):
            GenerationRequest(prompt="test", temperature=5.0)

    def test_prompt_length(self):
        """Test prompt length (buffer overflow/DoS prevention)."""
        long_prompt = "a" * 1001
        with self.assertRaises(ValidationError):
            GenerationRequest(prompt=long_prompt)

    def test_layer_config_constraints(self):
        """Test LayerConfig bounds (volume, pan)."""
        # Invalid volume
        with self.assertRaises(ValidationError):
            LayerConfig(prompt="test", volume=1.5)

        # Invalid pan
        with self.assertRaises(ValidationError):
            LayerConfig(prompt="test", pan=-2.0)

if __name__ == "__main__":
    unittest.main()
