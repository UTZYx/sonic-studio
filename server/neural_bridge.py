import os
import io
import torch
import uvicorn
import gc
import asyncio
import uuid
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from audiocraft.models import MusicGen, AudioGen
import torchaudio
import scipy.io.wavfile

# --- NEURAL BRIDGE CONFIG ---
PORT = int(os.getenv("PORT", 8000))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

app = FastAPI(title="Sonic Studio Neural Bridge")

# GPU Concurrency Guard (Resilience Channel)
gpu_lock = asyncio.Lock()

# CORS for Localhost Studio
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve outputs so the frontend can fetch individual stems
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

class ModelManager:
    def __init__(self):
        self.active_model = None
        self.active_type = None
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
    volume: float = 1.0
    pan: float = 0.0

class GenerationRequest(BaseModel):
    prompt: str
    type: str = "music"
    size: str = "small"
    layers: list[LayerConfig | str] | None = None
    duration: int = 10
    audio_context: str | None = None
    top_k: int = 250
    temperature: float = 1.0

@app.get("/health")
async def health_check():
    return {
        "status": "online", 
        "active_model": manager.active_type,
        "device": DEVICE,
        "vram_allocated": f"{torch.cuda.memory_allocated() / 1024 / 1024:.2f} MB" if torch.cuda.is_available() else "0 MB"
    }

def run_generation(req: GenerationRequest, model):
    """
    Decapitated Generation:
    Instead of mixing, this function generates stems and saves them to disk.
    It returns a list of URLs (or paths) to the generated stems.
    """
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

    model.set_generation_params(
        duration=req.duration,
        top_k=req.top_k,
        temperature=req.temperature
    )

    if req.audio_context:
            import base64
            audio_bytes = base64.b64decode(req.audio_context.split(",")[1])
            wav_context, sr = torchaudio.load(io.BytesIO(audio_bytes))
            wav_context = wav_context.to(DEVICE)

            if wav_context.dim() == 2:
                wav_context = wav_context.unsqueeze(0)
            if is_field:
                wav_context = wav_context.repeat(len(prompts), 1, 1)

            wav = model.generate_continuation(wav_context, model.sample_rate, prompts, progress=True)
    else:
        wav = model.generate(prompts, progress=True)

    # Save Stems
    stem_results = []
    job_id = str(uuid.uuid4())[:8]

    for i, layer_wav in enumerate(wav):
        # layer_wav is [C, T]
        stem_filename = f"{job_id}_stem_{i}.wav"
        stem_path = os.path.join(OUTPUT_DIR, stem_filename)

        # Save to disk
        wav_cpu = layer_wav.cpu().numpy().T
        scipy.io.wavfile.write(stem_path, 32000, wav_cpu)

        # In a real "Reflex" world, we return URLs
        # Assuming frontend can access via /outputs mount
        stem_url = f"http://localhost:8000/outputs/{stem_filename}"

        stem_results.append({
            "id": f"stem-{i}",
            "prompt": prompts[i],
            "url": stem_url
        })

    return stem_results

@app.post("/generate")
async def generate(req: GenerationRequest):
    if gpu_lock.locked():
        return JSONResponse(status_code=503, content={"error": "GPU Busy"})

    async with gpu_lock:
        model = manager.get_model(req.type, req.size)
        if not model:
            raise HTTPException(status_code=503, detail="Neural Engine failed to load model")

        try:
            loop = asyncio.get_running_loop()
            stems = await loop.run_in_executor(None, run_generation, req, model)
            
            return JSONResponse(content={"stems": stems})

        except Exception as e:
            print(f"[Neural Bridge] Generation Error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
