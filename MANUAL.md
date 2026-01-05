# Sonic Studio - Operational Manual

**Status**: Ready for Deployment
**Version**: 1.3 (Golden Master)

## Overview

Sonic Studio has evolved into a production-ready creative environment. It now features a robust "Field Composition" engine with spectral mixing, a learning "Synapse" brain, and a unified logging architecture.

## Key Features Delivered

### 1. Activating Sound (Neural Bridge)

The application requires the Python backend to utilize the Local GPU for sound generation.

```bash
# In a new terminal window:
cd server
python3 -m venv venv
source venv/bin/activate
# Install deps (Relaxed constraint for av)
pip install av
pip install audiocraft --no-deps
pip install torch torchaudio transformers sentencepiece uvicorn fastapi python-multipart
pip install julius omegaconf einops xformers num2words spacy protobuf librosa flashy hydra_colorlog
./start_bridge.sh
```

*Note: Installing `xformers` significantly speeds up generation but may require specific CUDA versions. If local bridge fails, the system automatically falls back to HuggingFace Cloud.*

### 2. The Mixer (Field Composition)

- **Volume & Pan**: Each layer in the timeline has dedicated sliders.
- **Spectral Fusion**: The backend `neural_bridge.py` now mathematically mixes layers with gain and stereo panning.
- **Solo Mode**: "S" button allows focused generation of single layers.

### 3. The Synapse Protocol (Feedback Loop)

- **Memory**: The system tracks your preferences in `synapse_weights.json`.
- **Reinforcement**: Favoriting a clip boosts its genre's "Gravity".
- **Visual Feedback**: The `NeuralNodeMonitor` displays the most active synaptic pathways (Top 3 Genres).

### 3. Foundation Hardening

- **Unified Logging**: A global `LogContext` streams events from all components to the main "Stream Output" panel.
- **Error Safety**: Automatic handling of broken audio URLs and robust error logging.
- **Code Hygiene**: Extracted `Style Matrix` to a dedicated module.

## Verification Checklist

### Feature Verification

- [x] **Mixer**: Verified dragging Volume/Pan sliders updates state.
- [x] **Solo**: Verified "Solo" button isolates layer activity.
- [x] **Archival**: Verified "Star" icon moves file and updates `Synapse` weights.
- [x] **Monitoring**: Verified `NeuralNodeMonitor` shows real-time load and Synapse stats.

### System Health

- **Build**: Passes Next.js build (ignoring external font fetch).
- **Logs**: All actions emit clear, human-readable logs to the UI.

## Next Steps

- **Production Use**: Begin composing exclusively in Sonic Studio.
- **Long-term**: Continue training the Synapse by using the tool.

## Deployment & Sound Activation

See task 5 in task.md for details.
