import os
import sys
import requests
import json
import time
from pathlib import Path
from datetime import datetime

# --- CONFIG ---
JOURNAL_PATH = Path("data/awareness_journal.md")
BACKEND_URL = "http://localhost:8000/health"
MODELS_DIR = Path.home() / "ai/models"
REQUIRED_MODELS = [
    "facebook__musicgen-small",
    "facebook__audiogen-medium",
    "suno__bark-small",
    "ResembleAI__resemble-enhance"
]

def log(message, level="INFO"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{timestamp}] [{level}] {message}"
    print(entry)

    # Append to Journal
    with open(JOURNAL_PATH, "a") as f:
        f.write(f"- {entry}\n")

def check_backend():
    log("Ping-ing Neural Bridge (System 2)...")
    try:
        res = requests.get(BACKEND_URL, timeout=2)
        if res.status_code == 200:
            data = res.json()
            log(f"Neural Bridge ONLINE. Device: {data.get('device')}. VRAM: {data.get('vram_allocated')}", "SUCCESS")
            return True
        else:
            log(f"Neural Bridge returned status {res.status_code}", "ERROR")
            return False
    except Exception as e:
        log(f"Neural Bridge UNREACHABLE: {e}", "CRITICAL")
        return False

def check_models():
    log("Auditing Sonic Grid Models...")
    missing = []
    if not MODELS_DIR.exists():
        log(f"Models Directory Not Found: {MODELS_DIR}", "WARNING")
        return False

    for model in REQUIRED_MODELS:
        model_path = MODELS_DIR / model
        if model_path.exists():
            log(f"Model Verified: {model}", "SUCCESS")
        else:
            # Flexible check for hugginface cache structure
            # Sometimes snapshot_download uses different structures.
            # But install_models.py defined specific local_dirs.
            log(f"Model Missing: {model}", "WARNING")
            missing.append(model)

    if missing:
        log(f"Missing {len(missing)} models. Run 'python install_models.py'.", "ACTION_REQUIRED")
        return False
    return True

def check_frontend():
    log("Scanning Frontend Integrity...")
    if not Path("node_modules").exists():
        log("node_modules missing. Run 'npm install'.", "CRITICAL")
        return False
    if not Path(".next").exists():
        log("Build artifact (.next) missing. System might be in Dev mode.", "INFO")

    log("Frontend structure appears valid.", "SUCCESS")
    return True

def main():
    os.makedirs("data", exist_ok=True)
    if not JOURNAL_PATH.exists():
        with open(JOURNAL_PATH, "w") as f:
            f.write("# Awareness Journal\n\n")

    log("--- INITIATING SYSTEM-WIDE DIAGNOSTIC ---", "SYSTEM")

    backend_ok = check_backend()
    models_ok = check_models()
    frontend_ok = check_frontend()

    status = "OPERATIONAL" if (backend_ok and frontend_ok) else "DEGRADED"
    log(f"Diagnostic Complete. System Status: {status}", "SUMMARY")

if __name__ == "__main__":
    main()
