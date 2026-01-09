import os
import io
import json
import uuid
import torch
import uvicorn
import gc
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel
from audiocraft.models import MusicGen, AudioGen
import torchaudio
import scipy.io.wavfile

# --- NEURAL BRIDGE CONFIG ---
PORT = int(os.getenv("PORT", 8000))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

app = FastAPI(title="Sonic Studio Neural Bridge")

# Serve Generated Outputs (Content Layer)
os.makedirs("server/outputs", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="server/outputs"), name="outputs")

# CORS for Localhost Studio
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ModelManager:
    def __init__(self):
        self.active_model = None
        self.active_type = None # "music" or "sfx"
        self.active_size = None

    def _offload(self):
        if self.active_model:
            print(f"[Neural Bridge] Offloading {self.active_type} to free VRAM...")
            self.active_model = None
            torch.cuda.empty_cache()
            gc.collect()

    def get_model(self, model_type="music", size="small"):
        if self.active_type == model_type and self.active_size == size and self.active_model:
            return self.active_model

        self._offload()
        
        print(f"[Neural Bridge] Loading {model_type.upper()} ({size}) on {DEVICE}...")
        try:
            if model_type == "music":
                self.active_model = MusicGen.get_pretrained(f'facebook/musicgen-{size}', device=DEVICE)
            elif model_type == "sfx":
                self.active_model = AudioGen.get_pretrained(f'facebook/audiogen-medium', device=DEVICE)
            
            self.active_type = model_type
            self.active_size = size
            return self.active_model
        except Exception as e:
            print(f"[Neural Bridge] Load Failed: {e}")
            return None

manager = ModelManager()

class LayerConfig(BaseModel):
    prompt: str
    volume: float = 1.0 # 0.0 to 1.0
    pan: float = 0.0 # -1.0 to 1.0

class GenerationRequest(BaseModel):
    prompt: str
    type: str = "music" # "music" or "sfx"
    size: str = "small"
    layers: list[LayerConfig | str] | None = None # Field Composition
    duration: int = 10
    audio_context: str | None = None
    top_k: int = 250
    temperature: float = 1.0

@app.get("/health")
async def health_check():
    """Heartbeat for the frontend"""
    return {
        "status": "online", 
        "active_model": manager.active_type,
        "device": DEVICE,
        "vram_allocated": f"{torch.cuda.memory_allocated() / 1024 / 1024:.2f} MB" if torch.cuda.is_available() else "0 MB"
    }

@app.post("/generate")
async def generate(req: GenerationRequest):
    """
    Generates audio and returns a Job Manifest (JSON) instead of a raw blob.
    Persists artifacts to disk for System 2 separation.
    """
    model = manager.get_model(req.type, req.size)
    if not model:
        raise HTTPException(status_code=503, detail="Neural Engine failed to load model")

    try:
        job_id = str(uuid.uuid4())
        job_dir = os.path.join("server/outputs", job_id)
        os.makedirs(job_dir, exist_ok=True)

        # Normalize Layers
        layers: list[LayerConfig] = []
        if req.layers:
            for l in req.layers:
                layers.append(LayerConfig(prompt=l) if isinstance(l, str) else l)
        else:
            layers.append(LayerConfig(prompt=req.prompt))

        prompts = [l.prompt for l in layers]
        is_field = len(layers) > 1

        print(f"[Neural Bridge] Igniting {req.type.upper()}: {len(layers)} layers ({req.duration}s)...")
        if is_field: 
            print(f"Field Composition: {[l.prompt for l in layers]}")

        # Configure
        model.set_generation_params(
            duration=req.duration,
            top_k=req.top_k,
            temperature=req.temperature
        )

        # Generate (Blocking GPU op)
        if req.audio_context:
             # Decode Base64 Context (Logic same as before, but batched if necessary)
             import base64
             audio_bytes = base64.b64decode(req.audio_context.split(",")[1])
             wav_context, sr = torchaudio.load(io.BytesIO(audio_bytes))
             wav_context = wav_context.to(DEVICE)
             
             # Expand context to batch size if Field Composition
             if wav_context.dim() == 2:
                 wav_context = wav_context.unsqueeze(0) # [1, C, T]
             if is_field:
                 wav_context = wav_context.repeat(len(prompts), 1, 1) # [N, C, T]

             wav = model.generate_continuation(wav_context, model.sample_rate, prompts, progress=True)
        else:
            wav = model.generate(prompts, progress=True) 
        
        # Post-Processing & Persistence
        # wav shape is [Batch, Channels, Time]
        
        manifest_files = {}

        # 1. Save Individual Stems (for Composability)
        if is_field:
            for i, layer_wav in enumerate(wav):
                # layer_wav is [C, T]
                stem_path = os.path.join(job_dir, f"stem_{i}.wav")

                # Expand Mono to Stereo if needed
                if layer_wav.shape[0] == 1:
                    layer_wav = layer_wav.repeat(2, 1)

                stem_cpu = layer_wav.cpu().numpy().T
                scipy.io.wavfile.write(stem_path, 32000, stem_cpu)
                manifest_files[f"stem_{i}"] = f"/outputs/{job_id}/stem_{i}.wav"

        # 2. Mix Down (for Preview/System 1)
        if is_field:
            print("Mixing Field Layers (Spectral Fusion)...")
            mixed_buffer = torch.zeros_like(wav[0]) # [C, T] assuming all same length

            for i, layer_wav in enumerate(wav):
                # layer_wav is [C, T]
                cfg = layers[i]
                
                # Apply Volume
                layer_wav = layer_wav * cfg.volume
                
                # Apply Pan (Simple Stereo Panning)
                if layer_wav.shape[0] == 1:
                    layer_wav = layer_wav.repeat(2, 1)

                left_gain = 1.0 if cfg.pan <= 0 else (1.0 - cfg.pan)
                right_gain = 1.0 if cfg.pan >= 0 else (1.0 + cfg.pan)
                
                layer_wav[0] *= left_gain
                layer_wav[1] *= right_gain
                
                mixed_buffer += layer_wav

            mixed = mixed_buffer
            
            # Simple Peak Normalization to -1dB
            max_val = torch.abs(mixed).max()
            if max_val > 0.9:
                mixed = mixed / (max_val + 1e-6) * 0.9
            
            wav_cpu = mixed.cpu()
        else:
            wav_cpu = wav[0].cpu() # Single batch
        
        # Save Mix
        audio_np = wav_cpu.numpy().T
        mix_path = os.path.join(job_dir, "mix.wav")
        scipy.io.wavfile.write(mix_path, 32000, audio_np)
        
        manifest_files["mix"] = f"/outputs/{job_id}/mix.wav"

        # 3. Create Manifest (The Receipt)
        manifest = {
            "job_id": job_id,
            "status": "completed",
            "type": req.type,
            "duration": req.duration,
            "files": manifest_files,
            "layers": [l.dict() for l in layers],
            "metadata": {
                "model": f"{req.type}-{req.size}",
                "device": DEVICE
            }
        }
        
        manifest_path = os.path.join(job_dir, "manifest.json")
        with open(manifest_path, "w") as f:
            json.dump(manifest, f, indent=2)

        print(f"[Neural Bridge] Job {job_id} Finalized. Manifest created.")
        return JSONResponse(content=manifest)

    except Exception as e:
        print(f"[Neural Bridge] Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
