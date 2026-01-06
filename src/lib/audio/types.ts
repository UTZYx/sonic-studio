export type AudioGenerationType = "tts" | "sfx" | "music";

export type IntelligenceLayer = "reflex" | "reasoning";

export interface SpatialContext {
    x: number;
    y: number;
    z: number;
    environment?: "studio" | "hall" | "outdoor" | "void";
}

export interface Stem {
    id: string;
    name: string; // e.g., "vocals", "kick", "bass"
    url: string;
    type: "audio" | "midi";
    metadata?: any;
}

export interface GenerationInput {
    text: string;
    layers?: (string | { prompt: string; volume?: number; pan?: number })[]; // Field Composition
    voiceId?: string;
    duration?: number;
    settings?: {
        warmth?: number;
        speed?: number;
        instrumentalOnly?: boolean;
        spatial?: SpatialContext; // 2026 Spatial Awareness
        [key: string]: any;
    };
}

export interface GenerationResult {
    url: string; // The "Master" mix
    stems?: Stem[]; // 12-Track Stem Extraction support
    metadata: {
        duration?: number;
        request_id?: string;
        byte_length?: number;
        intelligence_layer?: IntelligenceLayer; // which system generated this?
        provider?: string;
        [key: string]: any;
    };
    contentType: string;
}

/**
 * Universal interface for any AI Audio Provider.
 * This allows UTZYx to scale across multiple AI models (ElevenLabs, OpenAI, Stable Audio, Suno, etc.)
 */
export interface AudioProvider {
    generate(type: AudioGenerationType, input: GenerationInput): Promise<GenerationResult>;
}
