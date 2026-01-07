
import { AudioProvider, AudioGenerationType, GenerationInput, GenerationResult } from "../audio/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Neural Bridge Client (formerly HuggingFace Client)
 * Connects to the Local Neural Bridge (Python/FastAPI) running on Port 8000.
 * Supports: MusicGen, AudioGen, Bark, Resemble Enhance.
 */
export class HuggingFaceClient implements AudioProvider {
    private readonly apiKey: string;
    private readonly baseUrl = "https://router.huggingface.co/models/facebook/musicgen-small";

    private readonly localBridgeUrl = "http://127.0.0.1:8000";

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY || "";
        // if (!this.apiKey) console.warn("[HuggingFace] No API Key found. Rate limits will be strict.");
    }

    private async checkLocalBridge(): Promise<boolean> {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 1000);
            const res = await fetch(`${this.localBridgeUrl}/health`, { signal: controller.signal });
            clearTimeout(id);
            return res.ok;
        } catch {
            return false;
        }
    }

    async generate(type: AudioGenerationType, input: GenerationInput): Promise<GenerationResult> {
        // 1. Check Local Bridge
        const isLocal = await this.checkLocalBridge();

        if (isLocal) {
            console.log(`[Neural Bridge] Routing ${type.toUpperCase()} to Local Neural Engine...`);
            return this.generateLocal(type, input);
        }

        // 2. Fallback to Cloud (Only Music for now via HF Inference)
        if (type === "music") {
             console.log("[Neural Bridge] Offline. Igniting Cloud MusicGen (Free Tier)...");
             return this.generateCloud(input);
        }

        throw new Error(`Local Neural Bridge is Offline. Cannot generate ${type}. Please run 'python server/neural_bridge.py'.`);
    }

    private async generateLocal(type: AudioGenerationType, input: GenerationInput): Promise<GenerationResult> {
        // Map types to bridge models
        // Frontend uses "tts" legacy, backend wants "voice"
        let bridgeType = type;
        if (type === "tts") bridgeType = "voice";

        const response = await fetch(`${this.localBridgeUrl}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: input.text,
                type: bridgeType,
                size: input.settings?.size || "small", // Default to small for speed
                layers: input.layers,
                duration: input.duration || 10,
                audio_context: input.settings?.audioContext,
                enhance: input.settings?.enhance ?? true, // Default to True (Great Sound)
                top_k: 250,
                temperature: input.settings?.warmth || 1.0
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Local Bridge Error: ${err}`);
        }

        const blob = await response.blob();
        return this.blobToResult(blob, "local-neural-bridge", `${bridgeType}-enhanced`);
    }

    private async generateCloud(input: GenerationInput): Promise<GenerationResult> {
        const response = await fetch(this.baseUrl, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ inputs: input.text }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`HuggingFace Cloud Error (${response.status}): ${err}`);
        }

        const blob = await response.blob();
        return this.blobToResult(blob, "huggingface-cloud", "musicgen-small");
    }

    private async blobToResult(blob: Blob, provider: string, model: string): Promise<GenerationResult> {
        const buffer = Buffer.from(await blob.arrayBuffer());
        const base64 = buffer.toString("base64");
        const type = "audio/wav"; // Standardize on WAV
        const url = `data:${type};base64,${base64}`;

        return {
            url,
            metadata: {
                provider,
                model,
                request_id: uuidv4(),
                duration: 15 // Approx
            },
            contentType: type
        };
    }
}
