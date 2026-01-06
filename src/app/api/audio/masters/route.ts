import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Synapse } from "@/lib/orchestrator/synapse";

const STUDIO_OUTPUTS = path.join(process.env.HOME || "", "SonicStudio", "outputs");
const CASSINI_ARCHIVE = path.join(process.env.HOME || "", "CrimsonCassini", "archive", "masters");

// Ensure Archive Exists
if (!fs.existsSync(CASSINI_ARCHIVE)) {
    fs.mkdirSync(CASSINI_ARCHIVE, { recursive: true });
}

export async function POST(req: Request) {
    try {
        // "Masters" implies a curated selection.
        const { filename, prompt } = await req.json();
        if (!filename) return NextResponse.json({ error: "Filename required" }, { status: 400 });

        const sourcePath = path.join(STUDIO_OUTPUTS, filename);
        const destPath = path.join(CASSINI_ARCHIVE, filename);

        if (!fs.existsSync(sourcePath)) {
            return NextResponse.json({ error: "Source file not found" }, { status: 404 });
        }

        // Copy File
        fs.copyFileSync(sourcePath, destPath);

        // Synapse Protocol: Positive Reinforcement
        if (prompt) {
            const tags = prompt.split(/[ ,]+/).filter((t: string) => t.length > 3);
            Synapse.reinforce(tags, undefined, 0.1);
        }

        return NextResponse.json({ ok: true, path: destPath });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
