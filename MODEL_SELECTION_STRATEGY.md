# The Sonic Grid: Selected Models Strategy
*Deep Dive Analysis based on User Selection*

## 1. The Core Generators (The Crayon Box)
These models create the raw material.

*   **Facebook MusicGen Small / Stereo Small**:
    *   **Role**: The Workhorse. Reliable foundational music generation.
    *   **Why**: fast, controllable, supports continuation.
    *   **Use Case**: Rhythm Skeleton, Basic Harmonic progression.
*   **Mustango (Declare Lab)**:
    *   **Role**: Text-to-Audio generalist.
    *   **Why**: Good for western/cinematic textures.
    *   **Use Case**: Atmosphere layer.
*   **TangoFlux**:
    *   **Role**: Fast, flux-based generation.
    *   **Why**: Likely faster/different texture than MusicGen.
    *   **Use Case**: Details / Fillers.
*   **Riffusion (v1)**:
    *   **Role**: Spectrogram-based Lo-Fi/Texture.
    *   **Why**: Unique "visual" sound signature.
    *   **Use Case**: Experimental / Texture Layer.
    *   **Role**: The Powerhouse.
    *   **Why**: Large, high-fidelity foundation model.
    *   **Use Case**: The "Master" generator for key sections.

## 2. The Voices (TTS/Speech)
*   **Marvis TTS / FastSpeech2**:
    *   **Role**: Spoken word / Vocal chops.
    *   **Use Case**: Adding a "Human" element or vocal texture to the grid.

## 3. The Polishers (Post-Processing)
*   **Resemble Enhance (A MUST)**:
    *   **Role**: The "De-noiser" / "Upscaler".
    *   **Why**: Takes "dirty" AI output and makes it crisp.
    *   **Action**: Apply to every segment after generation.
*   **BigVGAN (Nvidia)**:
    *   **Role**: The Neural Vocoder.
    *   **Why**: High fidelity waveform reconstruction.
    *   **Use Case**: Final stage rendering.

## 4. The Analysts (The Ears)
*   **Wav2Vec2 Emotion**:
    *   **Role**: Feedback loop.
    *   **Why**: Check if the generated segment actually matches the requested "Mood".
*   **AST Audioset**:
    *   **Role**: Classification.
    *   **Why**: "Is this actually a drum beat?"
*   **Audiobox Aesthetics**:
    *   **Role**: Quality Control.
    *   **Why**: "Is this clip beautiful?" Rate the output 1-10.

## The Pipeline Vision
1.  **Generate**: MusicGen/Tango/LFM2 creates the raw block.
2.  **Evaluate**: Audiobox Aesthetics checks quality. If < 5, Regenerate.
3.  **Refine**: Resemble Enhance cleans up the noise.
4.  **Finish**: BigVGAN renders the final waveform.

**This is not just generation.**
**This is Generation + Critic + Mastering in one loop.**

## The UTZYx Core 7 (v0 Startup)
*Fast wins, clean pipeline. 2 Generators, 1 Enhancer, 1 Codec, 2 Analyzers.*

### 1. The Generators (Workhorse & Texture)
*   **facebook/musicgen-small** (or stereo-small)
    *   *Role*: Main Generator. Stable, fast.
*   **riffusion/riffusion-model-v1**
    *   *Role*: Vibe Engine. Good for texture/loops.

### 2. The Enhancer (Must-Have)
*   **ResembleAI/resemble-enhance**
    *   *Role*: Polisher. Reduces noise, makes output product-ready.

### 3. The Plumbing (Vocoder)
*   **nvidia/bigvgan_v2_22khz_80band_256x**
    *   *Role*: Vocoder. High quality reconstruction.

### 4. The Intelligence (Analysis)
*   **MIT/ast-finetuned-audioset**
    *   *Role*: Tagging. "What is this sound?"
*   **audeering/wav2vec2-emotion**
    *   *Role*: Mood Control. "Is this sad or happy?"

---
*Future Expansion (v1): Mustango, TangoFlux, Audiobox Aesthetics.*

## 5. Parked Models (Future Activation)
*   **LiquidAI LFM2-Audio-1.5B**:
    *   **Status**: PARKED.
    *   **Reason**: Too dominant for v1. Must earn the right to use it.

## 6. The Orchestrator Roles (To Be Built)
*These agents don't make sound. They make judgment.*

*   **Decision Agent**: Generate vs. Reuse vs. Enhance.
*   **Quality Gatekeeper**: Is this good enough to exist?
*   **Cost Guardian**: Does this justify the compute?
*   **Continuity Agent**: Does this fit the body of work?
