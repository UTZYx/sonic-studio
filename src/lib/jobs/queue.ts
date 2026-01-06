import PQueue from "p-queue";
import { JobStore } from "./store";
import { OrchestratorAgent } from "../orchestrator/agent";
import { AudioProvider } from "../audio/types";
import { ElevenClient } from "../elevenlabs/client";
import { HuggingFaceClient } from "../huggingface/client";

// Global singleton queue for "Compressing Tasks"
// Concurrency 1 ensures we don't overload the Local GPU Bridge (Neural Bridge)
// "The aligned pencils must be drawn one by one to form the perfect line."
const jobQueue = new PQueue({ concurrency: 1 });

console.log("[JobQueue] Initialized with Single-Threaded Compression.");

export const JobQueue = {
    /**
     * Adds a job to the processing queue.
     * The queue ensures that tasks are executed sequentially (FIFO).
     */
    add: (jobId: string) => {
        jobQueue.add(() => processJob(jobId));
        console.log(`[JobQueue] Job ${jobId} added to stream. Pending: ${jobQueue.pending}`);
    },

    getPendingCount: () => jobQueue.pending,
    get size() { return jobQueue.size; }
};

async function processJob(jobId: string) {
    const job = JobStore.get(jobId);
    if (!job) return;

    JobStore.update(jobId, { status: "processing" });

    try {
        // --- SECURITY & ROBUSTNESS CHECK ---
        // Sentinel: Truncate oversized prompts to prevent OOM/DoS
        const MAX_PROMPT_LEN = 1000;
        let safeText = job.input.text || "";
        if (safeText.length > MAX_PROMPT_LEN) {
            console.warn(`[Sentinel] Truncating oversized prompt for Job ${jobId}`);
            safeText = safeText.substring(0, MAX_PROMPT_LEN);
        }

        // 1. NEURAL ORCHESTRATION (The Brain)
        // Ask the Agent what to do based on the prompt
        const decision = OrchestratorAgent.decide(safeText, job.type as any);

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

        const providerToUse = providerInstance;

        // 2. FIELD COMPOSITION INJECTION
        // If the Agent suggests layers (e.g. "Cyberpunk" detected using Style Matrix)
        // AND the user hasn't manually defined layers, we inject them.
        let finalLayers = job.input.layers;

        if ((!finalLayers || finalLayers.length === 0) && decision.suggestedLayers) {
            console.log(`[Orchestrator] Auto-injecting layers for '${safeText}':`, decision.suggestedLayers);
            finalLayers = decision.suggestedLayers;
        }

        const startTime = Date.now();
        console.log(`[Neural Link] Job ${jobId} dispatched to ${providerToUse.constructor.name}`);

        const result = await providerToUse.generate(job.type as any, {
            text: safeText,
            layers: finalLayers, // Pass the layers (Manual or Injected)
            voiceId: job.input.voiceId || "",
            duration: job.input.duration || 10,
            settings: {
                ...(job.input.settings || {}),
                instrumentalOnly: job.input.settings?.instrumentalOnly
            }
        });

        const durationMs = Date.now() - startTime;
        console.log(`[Neural Link] Job ${jobId} Completed in ${durationMs}ms`);

        JobStore.update(jobId, {
            status: "completed",
            result
        });

    } catch (err: any) {
        console.error("[System Error] Job Execution Failed", err);

        const isQuota = err.message.includes("quota") || err.message.includes("401");

        JobStore.update(jobId, {
            status: isQuota ? "failed_quota" : "failed",
            error: isQuota ? "Neural Credits Depleted. Please Recharge." : err.message
        });
    }
}
