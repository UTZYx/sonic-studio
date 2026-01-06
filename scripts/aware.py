import os
import sys
import json
import time
import datetime
import urllib.request
import urllib.error
import glob
from pathlib import Path

# --- CONFIGURATION ---
JOURNAL_PATH = Path("data/awareness_journal.md")
OUTPUTS_DIR = Path("outputs") # Adjust if needed (MANIFESTO says ./outputs)
PROJECTS_DIR = Path("data/projects") # Inferred from memory/context
NEURAL_BRIDGE_URL = "http://localhost:8000/health"
STUDIO_URL = "http://localhost:3000"

class AwarenessAgent:
    def __init__(self):
        self.report = {
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "channels": {
                "signal": [],
                "structure": [],
                "innovation": [],
                "resilience": []
            }
        }

    def log(self, channel, message):
        print(f"[{channel.upper()}] {message}")
        self.report["channels"][channel].append(message)

    def scan_signal(self):
        """Signal Channel 🧭: What is the system telling us?"""
        self.log("signal", "Scanning active frequencies...")

        # Check Neural Bridge
        start = time.time()
        try:
            with urllib.request.urlopen(NEURAL_BRIDGE_URL, timeout=2) as response:
                if response.status == 200:
                    data = json.loads(response.read())
                    latency = (time.time() - start) * 1000
                    status = data.get("status", "unknown")
                    device = data.get("device", "unknown")
                    self.log("signal", f"Neural Bridge: ONLINE ({status}) on {device}. Latency: {latency:.0f}ms")
                else:
                    self.log("signal", f"Neural Bridge: WARN (Status {response.status})")
        except urllib.error.URLError:
             self.log("signal", "Neural Bridge: OFFLINE (Is 'python server/neural_bridge.py' running?)")
        except Exception as e:
            self.log("signal", f"Neural Bridge: ERROR ({str(e)})")

        # Check Studio UI
        start = time.time()
        try:
            with urllib.request.urlopen(STUDIO_URL, timeout=2) as response:
                 if response.status == 200:
                    latency = (time.time() - start) * 1000
                    self.log("signal", f"Sonic Studio UI: ONLINE. Latency: {latency:.0f}ms")
                 else:
                    self.log("signal", f"Sonic Studio UI: WARN (Status {response.status})")
        except (urllib.error.URLError, TimeoutError, OSError):
            self.log("signal", "Sonic Studio UI: OFFLINE (Is 'pnpm dev' running?)")

    def audit_structure(self):
        """Structural Vision Channel 🧠: How does it live inside the whole?"""
        self.log("structure", "Auditing file integrity...")

        # Check Output Orphans
        if OUTPUTS_DIR.exists():
            wavs = set(p.name for p in OUTPUTS_DIR.glob("*.wav"))
            jsons = set(p.name for p in OUTPUTS_DIR.glob("*.json"))

            # Expected: wav.json exists for every wav
            orphans = []
            for wav in wavs:
                json_name = wav + ".json"
                if json_name not in jsons:
                    orphans.append(wav)

            if orphans:
                self.log("structure", f"Found {len(orphans)} orphan audio files (missing metadata): {', '.join(orphans[:3])}...")
            else:
                self.log("structure", f"File Integrity: PERFECT ({len(wavs)} masters verified).")
        else:
             self.log("structure", "Outputs directory not found (Fresh install?).")

    def verify_resilience(self):
        """Resilience Channel 🛡️: What breaks when conditions change?"""
        self.log("resilience", "Verifying system hardiness...")

        # Simple Disk Check (Unix/Linux)
        try:
            stats = os.statvfs(".")
            free_gb = (stats.f_bavail * stats.f_frsize) / (1024**3)
            if free_gb < 10:
                self.log("resilience", f"Disk Space: CRITICAL ({free_gb:.1f} GB free).")
            else:
                self.log("resilience", f"Disk Space: HEALTHY ({free_gb:.1f} GB free).")
        except Exception:
            self.log("resilience", "Disk Space: Check skipped (OS not supported).")

    def seek_innovation(self):
        """Innovation Channel 🧪: Non-obvious improvements."""
        self.log("innovation", "Calculating optimization vectors...")

        # Heuristic: Check for old temp files or project density
        # For now, let's count "Projects" to see if we are scaling
        if PROJECTS_DIR.exists():
            project_count = len(list(PROJECTS_DIR.glob("*.json")))
            self.log("innovation", f"Project Density: {project_count} active projects.")
            if project_count > 50:
                self.log("innovation", "Insight: Consider archiving older projects to cold storage.")
        else:
            self.log("innovation", "Project Density: 0 (Canvas is blank).")

    def commit_to_journal(self):
        """Writes the session report to the Awareness Journal."""
        print("\n[AWARE] Committing to Journal...")

        if not JOURNAL_PATH.exists():
            print(f"Error: {JOURNAL_PATH} not found. Run the setup first.")
            return

        entry = f"\n### {self.report['timestamp']} – Daily Awareness Scan\n"

        # Format Signal
        entry += "**Signal 🧭:** " + "; ".join(self.report["channels"]["signal"]) + "\n"

        # Format Structure
        entry += "**Structural 🧠:** " + "; ".join(self.report["channels"]["structure"]) + "\n"

        # Format Innovation
        entry += "**Innovation 🧪:** " + "; ".join(self.report["channels"]["innovation"]) + "\n"

        # Format Resilience
        entry += "**Resilience 🛡️:** " + "; ".join(self.report["channels"]["resilience"]) + "\n"

        entry += "**Action:** Automated scan complete. System calibrated.\n"

        try:
            with open(JOURNAL_PATH, "a") as f:
                f.write(entry)
            print("[AWARE] Journal updated successfully.")
        except Exception as e:
            print(f"[AWARE] Failed to write journal: {e}")

    def run(self):
        print("::: AWARENESS AGENT v1.0 :::")
        print("Initializing Four Channels...\n")

        self.scan_signal()
        self.audit_structure()
        self.seek_innovation()
        self.verify_resilience()

        self.commit_to_journal()
        print("\n::: SCAN COMPLETE :::")

if __name__ == "__main__":
    agent = AwarenessAgent()
    agent.run()
