import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const OUTPUTS_DIR = path.join(process.env.HOME || "", "SonicStudio", "outputs");

export async function GET(req: Request, { params }: { params: { filename: string } }) {
    const filename = params.filename;
    if (!filename) return new NextResponse("Filename required", { status: 400 });

    // 🛡️ Sentinel: Prevent Path Traversal
    const safeOutputDir = path.resolve(OUTPUTS_DIR);
    const resolvedPath = path.resolve(safeOutputDir, filename);

    // Ensure strict directory containment (prevent /outputs_backup matching /outputs)
    if (!resolvedPath.startsWith(safeOutputDir + path.sep) && resolvedPath !== safeOutputDir) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(resolvedPath)) {
        return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    const stats = fs.statSync(resolvedPath);

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": filename.endsWith(".wav") ? "audio/wav" : "audio/mpeg",
            "Content-Length": stats.size.toString(),
            "Access-Control-Allow-Origin": "*"
        }
    });
}
