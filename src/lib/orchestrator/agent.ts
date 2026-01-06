
import { AudioGenerationType } from "../audio/types";
import { ReflexCore } from "./reflex";
import { ReasoningCore } from "./reasoning";

/**
 * THE ORCHESTRATOR (v2.0 - Hybrid Architecture)
 * ---------------------------------------------------------------------------
 * Implements System 1 (Reflex) vs System 2 (Reasoning) split.
 */

export interface Decision {
    provider: "cloud-eleven" | "cloud-hf" | "local-gpu" | "cloud-suno";
    type: AudioGenerationType;
    reasoning: string;
    suggestedLayers?: string[]; // If music, maybe suggest layers?
    detectedStyleId?: string;
    system?: "reflex" | "reasoning";
}

export class OrchestratorAgent {

    static decide(prompt: string, explicitMode?: string): Decision {
        const typeHint: AudioGenerationType = explicitMode as any || "music"; // Default hint

        // 1. REFLEX LAYER (System 1)
        // Check if we can handle this with zero-latency heuristics
        const reflexDecision = ReflexCore.evaluate(prompt, typeHint);
        if (reflexDecision) {
            return { ...reflexDecision, system: "reflex" };
        }

        // 2. REASONING LAYER (System 2)
        // Deep analysis required
        const reasoningDecision = ReasoningCore.evaluate(prompt, typeHint);
        return { ...reasoningDecision, system: "reasoning" };
    }
}
