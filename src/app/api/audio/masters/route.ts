import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { JobStore } from "@/lib/jobs/store";
import { MasterStore, MasterTrack } from "@/lib/masters/store";

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

        // 4. Save Metadata (Sidecar) for Synapse (Legacy/Backup)
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

        // 5. Register in MasterStore
        const stats = fs.statSync(filePath);
        const newTrack: MasterTrack = {
            id: filename,
            title: title || filename, // Use user title if available
            prompt: job.input.text,
            url: `/api/audio/serve/${filename}`,
            size: stats.size,
            created: Date.now(),
            type: ext === "wav" ? "music" : "voice",
            jobId: jobId
        };

        MasterStore.add(newTrack);

        return NextResponse.json({ ok: true, path: filePath });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const tracks = MasterStore.getAll();

        // Map to expected UI format if necessary, but MasterStore structure is already close.
        // The UI expects:
        // { id, title, prompt, url, size, created, type, assets }
        // MasterStore returns MasterTrack

        const mappedTracks = tracks.map(t => ({
            ...t,
            createdAt: new Date(t.created), // Legacy field
            assets: [{ storageUrl: t.url, byteLength: t.size }] // Legacy field
        }));

        return NextResponse.json({ tracks: mappedTracks });
    } catch (e: any) {
        return NextResponse.json({ tracks: [] });
    }
}
