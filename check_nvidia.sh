#!/bin/bash
# Check for System76 / Nvidia Drivers

echo "--- Checking GPU Status ---"
if command -v nvidia-smi &> /dev/null; then
    nvidia-smi --query-gpu=gpu_name,driver_version,memory.total --format=csv
else
    echo "⚠️  nvidia-smi not found."
    echo "To install System76 NVIDIA driver (recommended for Pop!_OS/Ubuntu):"
    echo "  sudo apt update"
    echo "  sudo apt install system76-driver-nvidia"
    echo "  sudo reboot"
fi
