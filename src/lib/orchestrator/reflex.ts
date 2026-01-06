
import { AudioGenerationType } from "../audio/types";
import { Decision } from "./agent";

// System 1: Reflex Layer
// Characteristics: Fast (<200ms), Rule-based, Heuristic, Local-Preferred
export class ReflexCore {
    static evaluate(prompt: string, type: AudioGenerationType): Decision | null {
        // Fast-path heuristics
        if (type === "sfx" && (prompt.includes("click") || prompt.includes("beep"))) {
            return {
                provider: "local-gpu",
                type: "sfx",
                reasoning: "[Reflex] High-frequency simple SFX detected. Routing to Local-GPU.",
                detectedStyleId: "ui_sfx"
            };
        }

        // Simple TTS commands
        if (type === "tts" && prompt.length < 50) {
            // Short, quick TTS -> Cloud is okay, but maybe local if available?
            // For now, let's say "Cloud-Eleven" is the reflex for high quality voice unless offline
            // But strict "Reflex" might prefer local.
            // Let's assume we want quality reflex:
            return {
                provider: "cloud-eleven",
                type: "tts",
                reasoning: "[Reflex] Short command speech detected. Immediate dispatch.",
                detectedStyleId: "fast_speech"
            };
        }

        // If no fast-path rule matches, return null to escalate to Reasoning (System 2)
        return null;
    }
}
