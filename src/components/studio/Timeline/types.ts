export type SegmentType = "intro" | "verse" | "chorus" | "bridge" | "outro";

export interface TimelineSegment {
    id: string;
    type: "Intro" | "Verse" | "Chorus" | "Bridge" | "Outro";
    duration: number; // seconds
    prompt: string;
    status: "idle" | "generating" | "completed" | "error";
    audioUrl?: string;
    color: string; // Visual color for the block

    // Rich Edit Features
    provider: "local-gpu" | "cloud-hf" | "cloud-eleven";
    versions: Array<{
        id: string;
        url: string;
        timestamp: number;
    }>;
    selectedVersionId?: string;

    // Deep Work Pipeline
    enhancePrompt: boolean; // "Good Prompt Engineering"
    loop: boolean;          // "Structure (loops)"
    postFx: "none" | "reverb" | "lofi" | "mastering"; // "Post-processing"

    // Constraints (The "Supports")
    mood: string;           // "A mood"
    density: "low" | "medium" | "high"; // "A density"

    // The "Consistency Engine"
    usePreviousContext: boolean; // If true, use previous block's audio as seed

    // Field Composition (Spectral Lanes)
    layers?: TimelineLayer[];
}

export interface TimelineLayer {
    id: string;
    role: "atmosphere" | "core" | "detail" | "custom"; // "Every model gets a lane"
    provider: "local-gpu" | "cloud-hf" | "cloud-eleven";
    prompt: string;
    active: boolean;
    volume?: number; // 0.0 to 1.0
    pan?: number;   // -1.0 (Left) to 1.0 (Right)
}

export const SEGMENT_TYPES = [
    { type: "Intro", label: "Intro", defaultDuration: 15, color: "cyan" },
    { type: "Verse", label: "Verse", defaultDuration: 30, color: "blue" },
    { type: "Chorus", label: "Chorus", defaultDuration: 30, color: "purple" },
    { type: "Bridge", label: "Bridge", defaultDuration: 15, color: "pink" },
    { type: "Outro", label: "Outro", defaultDuration: 15, color: "cyan" },
] as const;
