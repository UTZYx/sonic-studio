
export type TrackType = "tts" | "music" | "sfx";

export interface TrackAsset {
    id: string; // uuid
    trackId: string;
    storageUrl: string; // The URL to play/download (data-uri for now)
    mimeType: string;
    byteLength: number;
    checksum?: string;
    createdAt: number;
}

export interface Track {
    id: string; // uuid
    type: TrackType;
    title: string;
    prompt: string; // The text or description used
    voiceId?: string;
    modelId?: string;
    tags: string[];
    duration?: number; // Seconds
    settings?: {
        warmth?: number;
        speed?: number;
    };
    createdAt: number;
    assets: TrackAsset[]; // Usually just one audio file, but could be stems later
}
