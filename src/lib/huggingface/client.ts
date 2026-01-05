
import { AudioProvider, AudioGenerationType, GenerationInput, GenerationResult } from "../audio/types";
import { v4 as uuidv4 } from "uuid";

/**
 * HuggingFace Client for MusicGen (Free/Pro Tier)
 * A cost-effective alternative for the 'Sonic Grid'.
 */
export class HuggingFaceClient implements AudioProvider {
    private readonly apiKey: string;
    private readonly baseUrl = "https://router.huggingface.co/models/facebook/musicgen-small";

    private readonly localBridgeUrl = "http://127.0.0.1:8000";

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY || "";
        if (!this.apiKey) console.warn("[HuggingFace] No API Key found. Rate limits will be strict.");
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
        if (type !== "music") {
            throw new Error(`HuggingFaceClient only supports 'music' (via MusicGen). Requested: ${type}`);
        }

        // 1. Check Local Bridge (RTX 4060)
        const isLocal = await this.checkLocalBridge();

        if (isLocal) {
            console.log("[Neural Bridge] Routing to Local GPU (High Fidelity)...");
            return this.generateLocal(input);
        }

        // 2. Fallback to Cloud
        console.log("[HuggingFace] Local Bridge Offline. Igniting Cloud MusicGen (Free Tier)...");
        return this.generateCloud(input);
    }

    private async generateLocal(input: GenerationInput): Promise<GenerationResult> {
        const response = await fetch(`${this.localBridgeUrl}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: input.text,
                layers: input.layers, // Pass Crayon Phases
                duration: input.duration || 15,
                audio_context: input.settings?.audioContext // The Neural Link
            }),
        });

        if (!response.ok) {
            throw new Error(`Local Bridge Error: ${response.statusText}`);
        }

        const blob = await response.blob();
        return this.blobToResult(blob, "local-gpu", "musicgen-medium");
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
        // MusicGen outputs can be WAV or FLAC depending on pipe. Cloud is often flac check.
        // Local is WAV. We'll standardise in meta but the data uri needs correct type 
        // We'll inspect or assume based on provider.
        const type = provider === "local-gpu" ? "audio/wav" : "audio/flac";
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
