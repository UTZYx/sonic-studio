export type AudioGenerationType = "tts" | "sfx" | "music";

export interface GenerationInput {
    text: string;
    layers?: (string | { prompt: string; volume?: number; pan?: number })[]; // Field Composition
    voiceId?: string;
    duration?: number;
    settings?: {
        warmth?: number;
        speed?: number;
        instrumentalOnly?: boolean;
        [key: string]: any;
    };
}

export interface GenerationResult {
    url: string;
    metadata: {
        duration?: number;
        request_id?: string;
        byte_length?: number;
        [key: string]: any; // Allow flexible metadata for different providers
    };
    contentType: string;
}

/**
 * Universal interface for any AI Audio Provider.
 * This allows UTZYx to scale across multiple AI models (ElevenLabs, OpenAI, Stable Audio, etc.)
 */
export interface AudioProvider {
    generate(type: AudioGenerationType, input: GenerationInput): Promise<GenerationResult>;
}
