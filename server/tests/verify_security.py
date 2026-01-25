import sys
import os
import unittest
from unittest.mock import MagicMock
from pydantic import ValidationError

# Add server directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Mock heavy dependencies BEFORE importing neural_bridge
sys.modules["torch"] = MagicMock()
sys.modules["audiocraft"] = MagicMock()
sys.modules["audiocraft.models"] = MagicMock()
sys.modules["torchaudio"] = MagicMock()
sys.modules["scipy"] = MagicMock()
sys.modules["scipy.io"] = MagicMock()
sys.modules["scipy.io.wavfile"] = MagicMock()
sys.modules["uvicorn"] = MagicMock()

# Now import the models
try:
    from neural_bridge import GenerationRequest, LayerConfig
    print("Successfully imported models from neural_bridge")
except ImportError as e:
    print(f"Failed to import: {e}")
    sys.exit(1)

class TestSecurity(unittest.TestCase):
    def test_validation_constraints(self):
        """
        This test confirms that invalid inputs NOW raise pydantic.ValidationError.
        """
        print("\nTesting for validation (should REJECT invalid input)...")

        # 1. Huge Prompt
        long_prompt = "a" * 5000
        with self.assertRaises(ValidationError):
            GenerationRequest(prompt=long_prompt)
        print("Confirmed: Huge prompt rejected.")

        # 2. Invalid Duration (High)
        with self.assertRaises(ValidationError):
            GenerationRequest(prompt="test", duration=1000)
        print("Confirmed: High duration rejected.")

        # 2b. Invalid Duration (Low)
        with self.assertRaises(ValidationError):
            GenerationRequest(prompt="test", duration=0)
        print("Confirmed: Low duration rejected.")

        # 3. Invalid Top K
        with self.assertRaises(ValidationError):
            GenerationRequest(prompt="test", top_k=10000)
        print("Confirmed: Invalid top_k rejected.")

        # 4. Invalid Layer Config
        with self.assertRaises(ValidationError):
            LayerConfig(prompt="test", volume=5.0, pan=10.0)
        print("Confirmed: Invalid layer config rejected.")

        # 5. Invalid Layers List Length
        too_many_layers = ["test"] * 20
        with self.assertRaises(ValidationError):
            GenerationRequest(prompt="test", layers=too_many_layers)
        print("Confirmed: Too many layers rejected.")

        # 6. Invalid Type
        with self.assertRaises(ValidationError):
            GenerationRequest(prompt="test", type="invalid_type")
        print("Confirmed: Invalid type rejected.")

    def test_valid_inputs(self):
        """Ensure valid inputs are still accepted."""
        req = GenerationRequest(prompt="valid", duration=30, top_k=50, type="sfx")
        self.assertEqual(req.prompt, "valid")
        self.assertEqual(req.duration, 30)
        self.assertEqual(req.type, "sfx")
        print("Confirmed: Valid inputs accepted.")

if __name__ == "__main__":
    unittest.main()
