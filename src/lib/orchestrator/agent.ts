
import { AudioGenerationType } from "../audio/types";
import { Synapse } from "./synapse";
import { STYLE_MATRIX } from "./matrix";

/**
 * THE ORCHESTRATOR (v1.0)
 * ---------------------------------------------------------------------------
 * The "Brain" of the operation. 
 * instead of hardcoding logic in the UI, we ask the Orchestrator to decide.
 * 
 * Capabilities:
 * 1. Intent Analysis: "Does this look like a voice request or a beat?"
 * 2. Routing: "Should this go to Cloud-Eleven or Local-GPU?"
 * 3. Fallback Strategy: "If 11Labs is dead, what do we do?"
 */

export interface Decision {
    provider: "cloud-eleven" | "cloud-hf" | "local-gpu";
    type: AudioGenerationType;
    reasoning: string;
    suggestedLayers?: string[]; // If music, maybe suggest layers?
    detectedStyleId?: string;
}

export class OrchestratorAgent {

    static decide(prompt: string, explicitMode?: string): Decision {
        const p = prompt.toLowerCase();

        // STYLE MATRIX (The Knowledge Graph)
        const styleNodes = STYLE_MATRIX;

        // 1. Detect Style from Matrix with Synapse Reinforcement
        const matchedStyles = styleNodes.filter(s => {
            const hasKeyword = s.keywords.some(k => p.includes(k));
            return hasKeyword;
        });

        let suggestedLayers: string[] | undefined = undefined;
        let detectedReasoning = "";
        let detectedStyleId: string | undefined = undefined;

        if (matchedStyles.length > 0) {
            // Pick the strongest match, boosted by Synapse
            const bestStyle = matchedStyles.reduce((prev, curr) => {
                const prevGravity = Synapse.getGravity(prev.id);
                const currGravity = Synapse.getGravity(curr.id);
                return currGravity > prevGravity ? curr : prev;
            });
            suggestedLayers = bestStyle.layers;
            detectedStyleId = bestStyle.id;
            const gravity = Synapse.getGravity(bestStyle.id);
            detectedReasoning = `Detected '${bestStyle.id}' (Gravity: ${gravity.toFixed(2)}).`;
        }

        // 1. Explicit Mode Override
        if (explicitMode === "voice") {
            return {
                type: "tts",
                provider: "cloud-eleven",
                reasoning: "User explicitly selected Voice Mode.",
                detectedStyleId
            };
        }

        if (explicitMode === "music") {
            return {
                type: "music",
                provider: "local-gpu",
                reasoning: suggestedLayers
                    ? `${detectedReasoning} Orchestrating Field Composition.`
                    : "User selected Music. Routing to Crimson Engine.",
                suggestedLayers: suggestedLayers,
                detectedStyleId
            };
        }

        if (explicitMode === "sfx") {
            return {
                type: "sfx",
                provider: "local-gpu",
                reasoning: "User explicitly selected SFX Mode. Routing to AudioGen.",
                detectedStyleId
            };
        }

        // 2. Intent Inference (If no mode selected)
        if (p.includes("say") || p.includes("speak") || p.includes("voice") || p.includes("narrate")) {
            return {
                type: "tts",
                provider: "cloud-eleven",
                reasoning: "Detected speech intent."
            };
        }

        if (p.includes("sound") || p.includes("effect") || p.includes("noise") || p.includes("foley")) {
            return {
                type: "sfx",
                provider: "local-gpu",
                reasoning: "Detected SFX intent. Igniting AudioGen."
            };
        }

        // Default to Music
        return {
            type: "music",
            provider: "local-gpu",
            reasoning: "Defaulting to Matrix Engine."
        };
    }
}
