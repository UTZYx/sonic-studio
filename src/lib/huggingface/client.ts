
import { AudioProvider, AudioGenerationType, GenerationInput, GenerationResult } from "../audio/types";
import { v4 as uuidv4 } from "uuid";

/**
 * HuggingFace Client for MusicGen (Free/Pro Tier)
 * A cost-effective alternative for the 'Sonic Grid'.
 */
export class HuggingFaceClient implements AudioProvider {
    private readonly apiKey: string;
    private readonly baseUrl = "https://router.huggingface.co/models/facebook/musicgen-small";

    private readonly localBridgeUrl: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY || "";
        this.localBridgeUrl = process.env.NEXT_PUBLIC_NEURAL_BRIDGE_URL || "http://127.0.0.1:8000";
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
        // 1. Check Local Bridge (RTX 4060)
        const isLocal = await this.checkLocalBridge();

        if (isLocal) {
            console.log(`[Neural Bridge] Routing ${type.toUpperCase()} to Local GPU (High Fidelity)...`);
            return this.generateLocal(type, input);
        }

        // 2. Fallback to Cloud (Only Music for now)
        if (type !== "music") {
            throw new Error(`Cloud fallback only supports 'music'. Local bridge is offline for: ${type}`);
        }

        console.log("[HuggingFace] Local Bridge Offline. Igniting Cloud MusicGen (Free Tier)...");
        return this.generateCloud(input);
    }

    private async generateLocal(type: AudioGenerationType, input: GenerationInput): Promise<GenerationResult> {
        // Map types to bridge models
        const bridgeType = type === "music" ? "music" : "sfx";

        const response = await fetch(`${this.localBridgeUrl}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: input.text,
                type: bridgeType,
                size: input.settings?.size || "small", // Default to small for speed
                layers: input.layers,
                duration: input.duration || 10,
                audio_context: input.settings?.audioContext
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Local Bridge Error: ${err}`);
        }

        // Parse Manifest instead of Blob
        const manifest = await response.json();

        // Construct Full URLs
        const mixPath = manifest.files.mix;
        const fullMixUrl = `${this.localBridgeUrl}${mixPath}`;

        return {
            url: fullMixUrl,
            metadata: {
                provider: "local-gpu",
                model: manifest.metadata.model,
                request_id: manifest.job_id,
                duration: manifest.duration,
                stems: manifest.files // Attach full file map for future composability
            },
            contentType: "audio/wav"
        };
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
