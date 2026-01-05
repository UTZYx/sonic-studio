
import { v4 as uuidv4 } from "uuid";
import { AudioProvider, AudioGenerationType, GenerationInput, GenerationResult } from "../audio/types";

export interface TtsSettings {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
}

/**
 * Robust internal client for ElevenLabs
 * Now implements the universal AudioProvider interface.
 */
export class ElevenClient implements AudioProvider {
    private readonly apiKey: string;
    private readonly baseUrl = "https://api.elevenlabs.io/v1";
    private readonly isSimulation: boolean;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.ELEVENLABS_API_KEY;
        this.isSimulation = process.env.SIMULATE_AUDIO === "true";

        if (!key && !this.isSimulation) throw new Error("ElevenClient: Missing ELEVENLABS_API_KEY");
        this.apiKey = key || "sim_key";
    }

    /**
     * Universal entry point for generation.
     */
    async generate(type: AudioGenerationType, input: GenerationInput): Promise<GenerationResult> {
        if (type === "tts") {
            const warmth = input.settings?.warmth ?? 0.5;
            const speed = input.settings?.speed ?? 0.5;

            const settings: TtsSettings = {
                stability: 1.0 - warmth,
                similarity_boost: 0.75,
                style: speed,
                use_speaker_boost: true
            };
            return this.tts(input.text, input.voiceId || "21m00Tcm4TlvDq8ikWAM", "eleven_multilingual_v2", settings);
        } else if (type === "sfx") {
            return this.textToSoundEffects(input.text, input.duration || 5);
        } else if (type === "music") {
            return this.textToMusic(input.text, input.duration || 10, input.settings);
        }
        throw new Error(`Unsupported generation type: ${type}`);
    }

    private async blobToResult(blob: Blob, metadata: any, contentType: string): Promise<GenerationResult> {
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const url = `data:${contentType};base64,${base64}`;

        return {
            url,
            metadata,
            contentType
        };
    }

    private async mockGeneration(duration: number = 5): Promise<GenerationResult> {
        console.log("[ElevenClient] SIMULATION MODE: Returning mock audio...");
        await new Promise(r => setTimeout(r, 2000));

        const sampleRate = 44100;
        const numChannels = 1;
        const bitsPerSample = 16;
        const numSamples = sampleRate * (duration || 1);
        const dataSize = numSamples * numChannels * (bitsPerSample / 8);
        const fileSize = 36 + dataSize;

        const buffer = Buffer.alloc(44 + dataSize);
        buffer.write("RIFF", 0);
        buffer.writeUInt32LE(fileSize, 4);
        buffer.write("WAVE", 8);
        buffer.write("fmt ", 12);
        buffer.writeUInt32LE(16, 16);
        buffer.writeUInt16LE(1, 20);
        buffer.writeUInt16LE(numChannels, 22);
        buffer.writeUInt32LE(sampleRate, 24);
        buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
        buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
        buffer.writeUInt16LE(bitsPerSample, 34);
        buffer.write("data", 36);
        buffer.writeUInt32LE(dataSize, 40);

        for (let i = 0; i < numSamples; i++) {
            const val = Math.floor(Math.random() * 1000) - 500;
            buffer.writeInt16LE(val, 44 + i * 2);
        }

        const blob = new Blob([buffer], { type: "audio/wav" });
        return this.blobToResult(blob, {
            byte_length: blob.size,
            request_id: `sim_${uuidv4()}`,
            duration: duration
        }, "audio/wav");
    }

    async tts(text: string, voiceId: string, modelId: string = "eleven_multilingual_v2", settings?: TtsSettings): Promise<GenerationResult> {
        if (this.isSimulation) return this.mockGeneration();

        const url = `${this.baseUrl}/text-to-speech/${voiceId}`;
        const controller = new AbortController();
        const timeoutFn = setTimeout(() => controller.abort(), 60_000);

        try {
            const res = await fetch(url, {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": this.apiKey,
                    Accept: "audio/mpeg",
                },
                body: JSON.stringify({
                    text,
                    model_id: modelId,
                    voice_settings: settings || { stability: 0.5, similarity_boost: 0.75 },
                }),
            });

            if (!res.ok) {
                const errBody = await res.text().catch(() => "Unknown upstream error");
                throw new Error(`ElevenLabs TTS Failed (${res.status}): ${errBody.slice(0, 200)}`);
            }

            const contentType = res.headers.get("content-type") || "audio/mpeg";
            const blob = await res.blob();
            return this.blobToResult(blob, {
                byte_length: blob.size,
                request_id: res.headers.get("request-id") || uuidv4(),
            }, contentType);

        } finally {
            clearTimeout(timeoutFn);
        }
    }

    async textToSoundEffects(text: string, durationSeconds: number = 5, promptInfluence: number = 0.5): Promise<GenerationResult> {
        if (this.isSimulation) return this.mockGeneration(durationSeconds);

        const url = `${this.baseUrl}/sound-generation`;
        const controller = new AbortController();
        const timeoutFn = setTimeout(() => controller.abort(), 60_000);

        try {
            const res = await fetch(url, {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": this.apiKey,
                },
                body: JSON.stringify({
                    text,
                    duration_seconds: durationSeconds,
                    prompt_influence: promptInfluence,
                }),
            });

            if (!res.ok) {
                const errBody = await res.text().catch(() => "Unknown upstream error");
                throw new Error(`ElevenLabs SFX Failed (${res.status}): ${errBody.slice(0, 200)}`);
            }

            const contentType = res.headers.get("content-type") || "audio/mpeg";
            const blob = await res.blob();
            return this.blobToResult(blob, {
                byte_length: blob.size,
                request_id: res.headers.get("request-id") || uuidv4(),
                duration: durationSeconds,
            }, contentType);

        } finally {
            clearTimeout(timeoutFn);
        }
    }

    async textToMusic(text: string, durationSeconds: number = 10, settings?: any): Promise<GenerationResult> {
        if (this.isSimulation) return this.mockGeneration(durationSeconds);

        // Eleven Music (v1) Endpoint
        const url = `${this.baseUrl}/text-to-music`;
        const controller = new AbortController();
        const timeoutFn = setTimeout(() => controller.abort(), 120_000); // 2 min timeout for music

        try {
            // Neural refinement: Append 'instrumental' directive if flagged
            let prompt = text;
            if (settings?.instrumentalOnly) {
                prompt = `[Instrumental] ${prompt}`;
            }

            const res = await fetch(url, {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": this.apiKey,
                },
                body: JSON.stringify({
                    text: prompt,
                    // If the API supports explicit duration, we send it. 
                    // Otherwise the model decides based on text.
                    // For now, we attempt to send it.
                    duration_seconds: durationSeconds,
                    prompt_influence: settings?.speed || 0.75,
                }),
            });

            if (!res.ok) {
                const errBody = await res.text().catch(() => "Unknown upstream error");
                // Fallback or detailed error
                throw new Error(`ElevenLabs Music Failed (${res.status}): ${errBody.slice(0, 200)}`);
            }

            const contentType = res.headers.get("content-type") || "audio/mpeg";
            const blob = await res.blob();
            return this.blobToResult(blob, {
                byte_length: blob.size,
                request_id: res.headers.get("request-id") || uuidv4(),
                duration: durationSeconds,
            }, contentType);

        } finally {
            clearTimeout(timeoutFn);
        }
    }
}
