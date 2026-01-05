
import os
import io
import torch
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write
import torchaudio

# --- NEURAL BRIDGE CONFIG ---
# "medium" is the sweet spot for a 4060 (1.5B parameters, ~4GB VRAM usage)
# "large" (3.3B) might OOM if VRAM < 8GB with other apps open.
MODEL_SIZE = os.getenv("MUSICGEN_SIZE", "medium") 
PORT = int(os.getenv("PORT", 8000))

app = FastAPI(title="Sonic Studio Neural Bridge")

# CORS for Localhost Studio
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Model State
model = None

print(f"[{'CUDA' if torch.cuda.is_available() else 'CPU'}] Initializing Neural Bridge...")

try:
    # Preload Model on Startup
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Loading MusicGen ({MODEL_SIZE}) on {device}...")
    model = MusicGen.get_pretrained(f'facebook/musicgen-{MODEL_SIZE}', device=device)
    model.set_generation_params(duration=10) # Default
    print("Neural Bridge Connected. Ready for Synthesis.")
except Exception as e:
    print(f"Initialization Failed: {e}")

class LayerConfig(BaseModel):
    prompt: str
    volume: float = 1.0 # 0.0 to 1.0
    pan: float = 0.0 # -1.0 to 1.0

class GenerationRequest(BaseModel):
    prompt: str
    layers: list[LayerConfig | str] | None = None # Field Composition
    duration: int = 15
    audio_context: str | None = None
    use_sampling: bool = True
    top_k: int = 250
    top_p: float = 0.0
    temperature: float = 1.0

# ...

@app.get("/health")
async def health_check():
    """Heartbeat for the frontend"""
    if not model:
         raise HTTPException(status_code=503, detail="Neural Engine loading")
    return {"status": "online", "model": MODEL_SIZE, "device": "cuda" if torch.cuda.is_available() else "cpu"}

@app.post("/generate")
async def generate_music(req: GenerationRequest):
    """Ignite the local GPU for generation"""
    if not model:
        raise HTTPException(status_code=503, detail="Neural Engine not loaded")

    try:
        # Determine Prompts (Normalize to LayerConfig)
        layers: list[LayerConfig] = []
        
        if req.layers and len(req.layers) > 0:
            for l in req.layers:
                if isinstance(l, str):
                    layers.append(LayerConfig(prompt=l))
                else:
                    layers.append(l)
        else:
             layers.append(LayerConfig(prompt=req.prompt))

        prompts = [l.prompt for l in layers]
        is_field = len(layers) > 1

        print(f"Igniting: {len(layers)} layers ({req.duration}s)...")
        if is_field: 
            print(f"Field Composition: {[l.prompt for l in layers]}")

        # Configure
        model.set_generation_params(
            duration=req.duration,
            top_k=req.top_k,
            top_p=req.top_p,
            temperature=req.temperature
        )

        # Generate (Blocking GPU op)
        if req.audio_context:
             # Decode Base64 Context (Logic same as before, but batched if necessary)
             import base64
             audio_bytes = base64.b64decode(req.audio_context.split(",")[1])
             wav_context, sr = torchaudio.load(io.BytesIO(audio_bytes))
             wav_context = wav_context.to(device)
             
             # Expand context to batch size if Field Composition
             if wav_context.dim() == 2:
                 wav_context = wav_context.unsqueeze(0) # [1, C, T]
             if is_field:
                 wav_context = wav_context.repeat(len(prompts), 1, 1) # [N, C, T]

             wav = model.generate_continuation(wav_context, model.sample_rate, prompts, progress=True)
        else:
            wav = model.generate(prompts, progress=True) 
        
        # Post-Processing: Mix or Single
        # wav shape is [Batch, Channels, Time]
        
        if is_field:
            print("Mixing Field Layers (Spectral Fusion)...")
            mixed_buffer = torch.zeros_like(wav[0]) # [C, T] assuming all same length

            for i, layer_wav in enumerate(wav):
                # layer_wav is [C, T]
                cfg = layers[i]
                
                # Apply Volume
                layer_wav = layer_wav * cfg.volume
                
                # Apply Pan (Simple Stereo Panning)
                # Assumes model emits Stereo (2 channels). If Mono, expand.
                if layer_wav.shape[0] == 1:
                    layer_wav = layer_wav.repeat(2, 1)

                # Linear Pan Law: -1 (L=1, R=0) ... 0 (L=0.5, R=0.5) ... 1 (L=0, R=1) -> No, equal power is better but let's do simple linear approximation
                # Left = (1 - pan) / 2? No.
                # If pan = -1, L=1, R=0. If pan=0, L=1, R=1? Or L=0.5?
                # Standard console pan: Center = -3dB usually.
                # Let's use: L_gain = min(1, 1 - pan), R_gain = min(1, 1 + pan) ... allows Center to be louder (1, 1).
                # To maintain constant power: L = cos(theta), R = sin(theta).
                
                # Simple Linear for Speed:
                # pan element is -1 to 1.
                # L_factor = (1.0 - cfg.pan) * 0.5 + 0.5 if pan < 0 else (1.0 - cfg.pan) * 0.5 -> Complicated.
                
                # Let's use the straightforward "Balance" control style:
                left_gain = 1.0 if cfg.pan <= 0 else (1.0 - cfg.pan)
                right_gain = 1.0 if cfg.pan >= 0 else (1.0 + cfg.pan)
                
                layer_wav[0] *= left_gain
                layer_wav[1] *= right_gain
                
                mixed_buffer += layer_wav

            mixed = mixed_buffer
            
            # Simple Peak Normalization to -1dB to prevent clip
            max_val = torch.abs(mixed).max()
            if max_val > 0.9:
                mixed = mixed / (max_val + 1e-6) * 0.9
            
            wav_cpu = mixed.cpu()
        else:
            wav_cpu = wav[0].cpu() # Single batch
        
        # Use Torchaudio to save to buffer
        # Use Scipy for robust WAV encoding (Avoids AV/FFmpeg issues)
        import scipy.io.wavfile
        
        # wav_cpu is [Channels, Time] -> need [Time, Channels] for Scipy
        audio_np = wav_cpu.numpy().T
        
        buff = io.BytesIO()
        scipy.io.wavfile.write(buff, 32000, audio_np)
        buff.seek(0)
        
        return Response(content=buff.read(), media_type="audio/wav")

    except Exception as e:
        print(f"Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
