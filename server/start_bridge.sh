#!/bin/bash

# Sonic Studio - Neural Bridge Launcher
# Activates the AI environment and ignites the Python server

# 1. Activate the dedicated AI environment (User defined)
source ~/ai/venv/bin/activate

# 2. Check for dependencies (Auto-install if missing on first run)
if ! python3 -c "import audiocraft" &> /dev/null; then
    echo "[Neural Bridge] Installing dependencies..."
    pip install audiocraft fastapi uvicorn python-multipart
fi

# 3. Ignite the Bridge
echo "[Neural Bridge] Igniting on port 8000..."
echo "    > GPU: $(python3 -c 'import torch; print(torch.cuda.get_device_name(0))')"
echo "    > Model: facebook/musicgen-small (Default)"

# Run the server (Reload enabled for dev)
cd "$(dirname "$0")"
python3 -m uvicorn neural_bridge:app --host 0.0.0.0 --port 8000 --reload
