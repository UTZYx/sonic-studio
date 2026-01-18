export type AudioGenerationType = "tts" | "sfx" | "music" | "voice";

export interface GenerationInput {
    text: string;
    layers?: (string | { prompt: string; volume?: number; pan?: number })[]; // Field Composition
    voiceId?: string;
    duration?: number;
    provider?: string;
    settings?: {
        warmth?: number;
        speed?: number;
        instrumentalOnly?: boolean;
        enhance?: boolean; // Resemble Enhance
        audioContext?: string;
        size?: string;
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
