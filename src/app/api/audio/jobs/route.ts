
import { NextResponse } from "next/server";
import { JobStore } from "@/lib/jobs/store";
import { JobProcessor } from "@/lib/jobs/processor";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, type = "tts", voiceId, duration, settings, provider } = body;

        if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });

        // IMPORTANT: We must explicitly pass 'layers' from body to the job input
        const job = JobStore.create(type, {
            text,
            voiceId,
            duration,
            settings,
            provider,
            layers: body.layers
        });

        // Trigger async processing via the new separate service
        // We use setImmediate or just call it without await to let it run in background
        // In Next.js serverless envs, this might be risky, but for this persistent server architecture it's fine.
        JobProcessor.process(job.id);

        return NextResponse.json({ ok: true, jobId: job.id });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
