import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const OUTPUTS_DIR = path.join(process.env.HOME || "", "SonicStudio", "outputs");

export async function GET(req: Request, { params }: { params: { filename: string } }) {
    const filename = params.filename;
    if (!filename) return new NextResponse("Filename required", { status: 400 });

    // Resolve the absolute path to prevent traversal
    const filePath = path.resolve(OUTPUTS_DIR, filename);

    // Security Check: Ensure the path is strictly within OUTPUTS_DIR
    // We add path.sep to ensure we don't match partial directories like "outputs-secret"
    const allowedPath = OUTPUTS_DIR.endsWith(path.sep) ? OUTPUTS_DIR : OUTPUTS_DIR + path.sep;

    if (!filePath.startsWith(allowedPath)) {
        console.warn(`[Security] Blocked path traversal attempt: ${filename}`);
        return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
        return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": filename.endsWith(".wav") ? "audio/wav" : "audio/mpeg",
            "Content-Length": stats.size.toString(),
            "Access-Control-Allow-Origin": "*"
        }
    });
}
