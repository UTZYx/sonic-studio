import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { JobStore } from "@/lib/jobs/store";

const OUTPUTS_DIR = path.join(process.env.HOME || "", "SonicStudio", "outputs");
if (!fs.existsSync(OUTPUTS_DIR)) fs.mkdirSync(OUTPUTS_DIR, { recursive: true });

export async function POST(req: Request) {
    try {
        const { jobId, title } = await req.json();
        const job = JobStore.get(jobId);

        if (!job || !job.result?.url) {
            return NextResponse.json({ error: "Job result not found" }, { status: 404 });
        }

        // 1. Decode Data URL
        const dataUrl = job.result.url;
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            return NextResponse.json({ error: "Invalid data URL" }, { status: 500 });
        }

        const type = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        const ext = type.includes("wav") ? "wav" : "mp3";

        // 2. Sanitize Title
        const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        const filename = `${safeTitle}_${jobId.slice(0, 8)}.${ext}`;
        const filePath = path.join(OUTPUTS_DIR, filename);

        // 3. Save Audio
        fs.writeFileSync(filePath, buffer);

        // 4. Save Metadata (Sidecar) for Synapse
        const metaPath = path.join(OUTPUTS_DIR, `${filename}.json`);
        const metadata = {
            id: jobId,
            prompt: job.input.text,
            layers: job.input.layers,
            settings: job.input.settings,
            provider: job.result.metadata.provider,
            created: Date.now()
        };
        fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

        return NextResponse.json({ ok: true, path: filePath });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    // Basic endpoint to list tracks if needed, but we use api/audio/library usually.
    // However, LibraryPanel.tsx calls fetch("/api/audio/tracks") in line 15!
    // So we must implement the list here or redirect LibraryPanel to use library endpoint.
    // I will implement list logic here to fix LibraryPanel.

    // Actually, I created api/audio/library earlier. I should unify.
    // But LibraryPanel.tsx (Step 3994) calls `/api/audio/tracks`.
    // I will implement the listing logic here to match LibraryPanel's expectation.

    try {
        const files = fs.readdirSync(OUTPUTS_DIR)
            .filter(f => f.endsWith(".wav") || f.endsWith(".mp3"));

        const tracks = files.map(f => {
            const fullPath = path.join(OUTPUTS_DIR, f);
            const stats = fs.statSync(fullPath);

            // Try to read metadata sidecar
            let prompt: string | null = null;
            const metaPath = fullPath + ".json";
            if (fs.existsSync(metaPath)) {
                try {
                    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
                    // Ensure we have a string
                    if (meta.prompt && typeof meta.prompt === 'string') {
                        prompt = meta.prompt;
                    }
                } catch (e) {
                    // Ignore corrupted sidecar files
                }
            }

            return {
                id: f, // use filename as ID
                title: f,
                prompt: prompt,
                url: `/api/audio/serve/${f}`,
                size: stats.size,
                created: stats.birthtimeMs,
                type: f.endsWith(".wav") ? "music" : "voice", // rough guess
                createdAt: stats.birthtime,
                assets: [{ storageUrl: `/api/audio/serve/${f}`, byteLength: stats.size }]
            };
        }).sort((a, b) => b.created - a.created);

        return NextResponse.json({ tracks });
    } catch (e: any) {
        return NextResponse.json({ tracks: [] });
    }
}
