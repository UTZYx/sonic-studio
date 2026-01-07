import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const OUTPUTS_DIR = path.join(process.env.HOME || "", "SonicStudio", "outputs");

export async function GET(req: Request, { params }: { params: { filename: string } }) {
    const filename = params.filename;
    if (!filename) return new NextResponse("Filename required", { status: 400 });

    const resolvedPath = path.resolve(OUTPUTS_DIR, filename);

    // Security Check: Path Traversal Prevention
    if (!resolvedPath.startsWith(OUTPUTS_DIR + path.sep)) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(resolvedPath)) {
        return new NextResponse("File not found", { status: 404 });
    }

    const filePath = resolvedPath;

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
