import { JobStore } from "./store";
import { OrchestratorAgent } from "../orchestrator/agent";
import { AudioProvider } from "../audio/types";
import { ElevenClient } from "../elevenlabs/client";
import { HuggingFaceClient } from "../huggingface/client";
import { Synapse } from "../orchestrator/synapse";

export class JobProcessor {
    static async process(jobId: string) {
        const job = JobStore.get(jobId);
        if (!job) {
            console.error(`[JobProcessor] Job ${jobId} not found.`);
            return;
        }

        JobStore.update(jobId, { status: "processing" });

        try {
            // 1. NEURAL ORCHESTRATION (The Brain)
            // Ask the Agent what to do based on the prompt
            const decision = OrchestratorAgent.decide(job.input.text || "", job.type as any);

            // 2. PROVIDER SELECTION
            let providerInstance: AudioProvider;
            const requestedProvider = job.input.provider;

            // Routing Logic: Explicit Override > Agent Decision > Fallback
            const targetProvider = requestedProvider || decision.provider;

            if (targetProvider === "cloud-eleven") {
                providerInstance = new ElevenClient();
            } else if (targetProvider === "cloud-hf" || targetProvider === "local-gpu") {
                // Both map to HFClient which handles the local bridge check internally
                providerInstance = new HuggingFaceClient();
            } else {
                // Default Fallback
                providerInstance = new HuggingFaceClient();
            }

            // 3. LAYER INJECTION
            // If the Agent suggests layers (e.g. "Cyberpunk" detected using Style Matrix)
            // AND the user hasn't manually defined layers, we inject them.
            let finalLayers = job.input.layers;

            if ((!finalLayers || finalLayers.length === 0) && decision.suggestedLayers) {
                console.log(`[JobProcessor] Auto-injecting layers for '${job.input.text}':`, decision.suggestedLayers);
                finalLayers = decision.suggestedLayers;

                // Reinforce the style in Synapse Memory if we auto-detected it
                // This makes the system "learn" that this prompt correlates to these layers/style
                if (decision.detectedStyleId) {
                    Synapse.reinforce([decision.detectedStyleId], undefined, 0.05);
                }
            }

            const startTime = Date.now();
            console.log(`[JobProcessor] Job ${jobId} dispatched to ${providerInstance.constructor.name} (Provider: ${targetProvider})`);

            // 4. GENERATION
            const result = await providerInstance.generate(job.type as any, {
                text: job.input.text || "",
                layers: finalLayers, // Pass the layers (Manual or Injected)
                voiceId: job.input.voiceId || "",
                duration: job.input.duration || 10,
                settings: {
                    ...(job.input.settings || {}),
                    instrumentalOnly: job.input.settings?.instrumentalOnly
                }
            });

            const durationMs = Date.now() - startTime;
            console.log(`[JobProcessor] Job ${jobId} Completed in ${durationMs}ms`);

            // 5. SUCCESS & LEARNING
            JobStore.update(jobId, {
                status: "completed",
                result
            });

            // Reinforce the provider that worked
            // Synapse.reinforce([], targetProvider, 0.05);

        } catch (err: any) {
            console.error(`[JobProcessor] Job ${jobId} Failed:`, err);

            const isQuota = err.message.includes("quota") || err.message.includes("401");

            JobStore.update(jobId, {
                status: isQuota ? "failed_quota" : "failed",
                error: isQuota ? "Neural Credits Depleted. Please Recharge." : err.message
            });

            // Punish the provider if it failed (optional complexity)
        }
    }
}
