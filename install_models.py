import os
from huggingface_hub import snapshot_download

# The UTZYx Core 7 (v0)
# Phased Crayons: 2 Gen, 1 Enhance, 1 Codec, 2 Analysis + 1 Voice (Local)
models = [
  "facebook/musicgen-small",               # Workhorse Generator
  "facebook/audiogen-medium",              # SFX Generator (Added)
  "riffusion/riffusion-model-v1",          # Texture Generator
  "ResembleAI/resemble-enhance",           # Polisher (Must-have)
  "nvidia/bigvgan_v2_22khz_80band_256x",   # Vocoder
  "MIT/ast-finetuned-audioset-10-10-0.4593", # Analyzer (Tagging)
  "audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim", # Analyzer (Emotion)
  "suno/bark-small"                        # Voice (Local) - Transformers Native
]

base_dir = os.path.expanduser("~/ai/models")
os.makedirs(base_dir, exist_ok=True)

print(f"Igniting Model Download to {base_dir}...")
print("This may take a while depending on connection speeds.")

for m in models:
    print(f" >> Downloading: {m}")
    # Flatten folder structure slightly for easier access
    local_name = m.replace("/", "__")
    snapshot_download(
        repo_id=m, 
        local_dir=os.path.join(base_dir, local_name), 
        local_dir_use_symlinks=False
    )

print("------------------------------------------------")
print("UTZYx Core 7 Download Complete.")
print("The Instrument Rack is stocked.")
