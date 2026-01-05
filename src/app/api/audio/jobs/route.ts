
import { NextResponse } from "next/server";
import { JobStore } from "@/lib/jobs/store";
import { ElevenClient } from "@/lib/elevenlabs/client";
import { HuggingFaceClient } from "@/lib/huggingface/client";
import { AudioProvider } from "@/lib/audio/types";
import { OrchestratorAgent } from "@/lib/orchestrator/agent";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, type = "tts", voiceId, duration, settings, provider } = body;

        if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });

        // IMPORTANT: We must explicitly pass 'layers' from body to the job input
        // Inject Tempo into Prompt if present (MusicGen workaround)
        let processedText = text;
        if (type === "music" && settings?.tempo) {
            processedText = `${processedText}, ${settings.tempo} BPM`;
        }

        const job = JobStore.create(type, {
            text: processedText,
            voiceId,
            duration,
            settings,
            provider,
            layers: body.layers
        });

        // Trigger async processing
        processJob(job.id);

        return NextResponse.json({ ok: true, jobId: job.id });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

async function processJob(jobId: string) {
    const job = JobStore.get(jobId);
    if (!job) return;

    JobStore.update(jobId, { status: "processing" });

    try {
        // 1. NEURAL ORCHESTRATION (The Brain)
        // Ask the Agent what to do based on the prompt
        const decision = OrchestratorAgent.decide(job.input.text || "", job.type as any);

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
            console.log(`[Orchestrator] Auto-injecting layers for '${job.input.text}':`, decision.suggestedLayers);
            finalLayers = decision.suggestedLayers;
        }

        const startTime = Date.now();
        console.log(`[Neural Link] Job ${jobId} dispatched to ${providerToUse.constructor.name}`);

        const result = await providerToUse.generate(job.type as any, {
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
