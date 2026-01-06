import os
import io
import torch
import uvicorn
import gc
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from audiocraft.models import MusicGen, AudioGen
import torchaudio
import scipy.io.wavfile
from resemble_enhance.enhancer.inference import denoise, enhance
from transformers import AutoProcessor, BarkModel

# --- NEURAL BRIDGE CONFIG ---
PORT = int(os.getenv("PORT", 8000))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

app = FastAPI(title="Sonic Studio Neural Bridge")

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
        self.active_type = None # "music", "sfx", or "voice"
        self.active_size = None
        self.voice_processor = None

    def _offload(self):
        if self.active_model:
            print(f"[Neural Bridge] Offloading {self.active_type} to free VRAM...")
            self.active_model = None
            self.voice_processor = None
            torch.cuda.empty_cache()
            gc.collect()

    def get_model(self, model_type="music", size="small"):
        # Check if already loaded
        if self.active_type == model_type and self.active_size == size and self.active_model:
            return self.active_model

        # Force offload to ensure clean slate (Load-on-Demand)
        self._offload()
        
        print(f"[Neural Bridge] Loading {model_type.upper()} ({size}) on {DEVICE}...")
        try:
            if model_type == "music":
                self.active_model = MusicGen.get_pretrained(f'facebook/musicgen-{size}', device=DEVICE)
            elif model_type == "sfx":
                self.active_model = AudioGen.get_pretrained(f'facebook/audiogen-medium', device=DEVICE)
            elif model_type == "voice":
                # Using Bark for High Quality Generative Voice
                print("[Neural Bridge] Initializing Bark (Transformers)...")
                self.voice_processor = AutoProcessor.from_pretrained("suno/bark-small")
                self.active_model = BarkModel.from_pretrained("suno/bark-small").to(DEVICE)
            
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
    type: str = "music" # "music", "sfx", "voice"
    size: str = "small"
    layers: list[LayerConfig | str] | None = None # Field Composition
    duration: int = 10
    audio_context: str | None = None
    top_k: int = 250
    temperature: float = 1.0
    enhance: bool = True # Default to True for "Great Sound"

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
    model = manager.get_model(req.type, req.size)
    if not model:
        raise HTTPException(status_code=503, detail="Neural Engine failed to load model")

    try:
        wav_cpu = None
        sample_rate = 32000

        # --- VOICE GENERATION PATH ---
        if req.type == "voice":
            print(f"[Neural Bridge] Speaking: {req.prompt}")
            processor = manager.voice_processor
            inputs = processor(
                text=[req.prompt],
                return_tensors="pt",
            ).to(DEVICE)

            # Bark Generation
            # Note: Bark doesn't support duration control directly, it speaks the text.
            audio_array = model.generate(**inputs, do_sample=True)

            # Bark output is [1, T]. SR is 24000 usually.
            wav = audio_array.cpu()
            sample_rate = model.generation_config.sample_rate # Typically 24000

            # Ensure shape [C, T]
            if wav.dim() == 2:
                # [1, T] -> [1, T] ok
                pass

            wav_cpu = wav[0].unsqueeze(0) # [1, T]

        # --- MUSIC / SFX GENERATION PATH ---
        else:
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

            # Configure MusicGen/AudioGen
            model.set_generation_params(
                duration=req.duration,
                top_k=req.top_k,
                temperature=req.temperature
            )
            sample_rate = model.sample_rate

            # Generate
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

            # Mixing Logic
            if is_field:
                print("Mixing Field Layers (Spectral Fusion)...")
                mixed_buffer = torch.zeros_like(wav[0])

                for i, layer_wav in enumerate(wav):
                    cfg = layers[i]
                    layer_wav = layer_wav * cfg.volume
                    if layer_wav.shape[0] == 1:
                        layer_wav = layer_wav.repeat(2, 1)

                    left_gain = 1.0 if cfg.pan <= 0 else (1.0 - cfg.pan)
                    right_gain = 1.0 if cfg.pan >= 0 else (1.0 + cfg.pan)

                    layer_wav[0] *= left_gain
                    layer_wav[1] *= right_gain

                    mixed_buffer += layer_wav

                mixed = mixed_buffer
                max_val = torch.abs(mixed).max()
                if max_val > 0.9:
                    mixed = mixed / (max_val + 1e-6) * 0.9
                wav_cpu = mixed.cpu()
            else:
                wav_cpu = wav[0].cpu()

        # --- THE POLISHER (RESEMBLE ENHANCE) ---
        if req.enhance:
            print("[Neural Bridge] Polishing Audio (Resemble Enhance)...")
            # Resemble expects [Time] or [Channels, Time]?
            # Documentation says: enhance(wav, sr, device, ...)
            # wav: torch.Tensor [T] or [C, T]
            
            # Ensure we are on CPU first to avoid VRAM conflict if enhancer is large?
            # Actually enhancer runs on GPU if device is passed.
            # But we might need to offload the generator first if VRAM is tight (Consumer GPU).
            # For safety: Let's keep it on GPU if we have it, but maybe unload generator?
            # Let's try running it. If OOM, we know why.
            
            # Resemble Enhance input needs to be Tensor on Device.
            wav_input = wav_cpu.to(DEVICE)

            # If Stereo [2, T], enhance expects mono? No, it handles it?
            # Actually, `enhance` often expects Mono [T] for speech.
            # But for Music, we want Stereo.
            # Let's check if enhance supports stereo.
            # If not, we process channels separately.

            # Assume Mono for simplicity if uncertain, but MusicGen is stereo.
            # Enhance repo says: "The model is trained on 44.1kHz mono audio."
            # So we must apply to each channel separately.

            enhanced_channels = []
            channels = wav_input.shape[0]

            for c in range(channels):
                # Enhance returns (sr, wav)
                # nfe=64 is standard. solver="midpoint" is good.
                # lambd=0.5 denoising strength.

                # wav_input[c] is [T]
                # returns (new_sr, new_wav_tensor)
                new_sr, new_wav = enhance(
                    wav_input[c],
                    sample_rate,
                    DEVICE,
                    nfe=64,
                    solver="midpoint",
                    lambd=0.5,
                    tau=0.5
                )
                enhanced_channels.append(new_wav.cpu())
                sample_rate = new_sr # Update SR (usually 44100)

            # Stack back to [C, T]
            wav_cpu = torch.stack(enhanced_channels)

            # Normalize post-enhance
            max_val = torch.abs(wav_cpu).max()
            if max_val > 0.95:
                wav_cpu = wav_cpu / (max_val + 1e-6) * 0.95

        # --- ENCODING ---
        audio_np = wav_cpu.numpy().T # [Time, Channels]
        
        buff = io.BytesIO()
        scipy.io.wavfile.write(buff, sample_rate, audio_np)
        buff.seek(0)
        
        return Response(content=buff.read(), media_type="audio/wav")

    except Exception as e:
        print(f"[Neural Bridge] Generation Error: {e}")
        # import traceback
        # traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
