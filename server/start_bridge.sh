#!/bin/bash

# Sonic Studio - Neural Bridge Launcher
# Activates the AI environment and ignites the Python server

# 1. Activate the dedicated AI environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "[Neural Bridge] Configuring virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install audiocraft fastapi uvicorn python-multipart
fi

# 3. Ignite the Bridge
echo "[Neural Bridge] Igniting on port 8000..."
echo "    > GPU: $(python3 -c 'import torch; print(torch.cuda.get_device_name(0))')"
echo "    > Model: facebook/musicgen-small (Default)"

# Run the server (Reload enabled for dev)
cd "$(dirname "$0")"
python3 -m uvicorn neural_bridge:app --host 0.0.0.0 --port 8000 --reload
