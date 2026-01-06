
import { AudioGenerationType } from "../audio/types";
import { Decision } from "./agent";
import { Synapse } from "./synapse";
import { STYLE_MATRIX } from "./matrix";

// System 2: Reasoning Layer
// Characteristics: Deep Analysis, Context-Aware, Cloud-Biased, Creative
export class ReasoningCore {
    static evaluate(prompt: string, type: AudioGenerationType): Decision {
        const p = prompt.toLowerCase();

        // 1. Deep Style Analysis via Matrix
        const styleNodes = STYLE_MATRIX;
        const matchedStyles = styleNodes.filter(s => {
            return s.keywords.some(k => p.includes(k));
        });

        let bestStyle = null;
        let reasoningLog = "[Reasoning] Analyzing semantic intent... ";

        if (matchedStyles.length > 0) {
            // Apply Synapse Memory weighting
            bestStyle = matchedStyles.reduce((prev, curr) => {
                return Synapse.getGravity(curr.id) > Synapse.getGravity(prev.id) ? curr : prev;
            });
            reasoningLog += `Identified '${bestStyle.id}' pattern. `;
        }

        // 2. Complex Logic for Music
        if (type === "music" || p.includes("song") || p.includes("track")) {
            return {
                type: "music",
                provider: "cloud-hf", // Or "cloud-suno" if we had it
                reasoning: `${reasoningLog} Complex composition required. Engaging Generative Transformer.`,
                suggestedLayers: bestStyle ? bestStyle.layers : ["drums", "bass", "synth"], // Basic stem architecture
                detectedStyleId: bestStyle?.id
            };
        }

        // 3. Complex Narratives (Long TTS)
        if (type === "tts" || p.length > 50) {
            return {
                type: "tts",
                provider: "cloud-eleven",
                reasoning: `${reasoningLog} Long-form narrative detected. Engaging Contextual Speech Engine.`,
                detectedStyleId: "narrative"
            };
        }

        // Fallback
        return {
            type: type,
            provider: "local-gpu",
            reasoning: "[Reasoning] No specific high-level pattern. Defaulting to standard compute.",
            detectedStyleId: "standard"
        };
    }
}
