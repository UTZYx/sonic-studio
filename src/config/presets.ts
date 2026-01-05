
export interface VoicePreset {
    id: string;
    name: string;
    description: string;
    elevenLabsId: string;
    style: "feminine" | "masculine" | "neutral";
}

export const VOICE_PRESETS: VoicePreset[] = [
    {
        id: "system_core",
        name: "SYSTEM // CORE",
        description: "Standard Neural Interface (Calm, Professional)",
        elevenLabsId: "21m00Tcm4TlvDq8ikWAM", // Rachel
        style: "feminine"
    },
    {
        id: "grid_news",
        name: "GRID // NEWS",
        description: "Sector 7 Broadcast Anchor",
        elevenLabsId: "29vD33N1CtxCmqQRPOHJ", // Drew
        style: "masculine"
    },
    {
        id: "runner",
        name: "VOID // RUNNER",
        description: "Fast-talker, energetic (Edgy)",
        elevenLabsId: "D38z5RcWu1voky8WS1ja", // Fin
        style: "masculine"
    },
    {
        id: "glitch_sprite",
        name: "GLITCH // SPRITE",
        description: "AI Construct (Playful, Young)",
        elevenLabsId: "zrHiDhphv9ZnVXBqCLjf", // Mimi
        style: "feminine"
    },
    {
        id: "sector_guard",
        name: "SECTOR // GUARD",
        description: "Heavy enforcement unit (Deep, Authoritative)",
        elevenLabsId: "zcAOhNBS3c14rBihAFp1", // Giovanni
        style: "masculine"
    }
];

export const DEFAULT_PRESET = VOICE_PRESETS[0];
