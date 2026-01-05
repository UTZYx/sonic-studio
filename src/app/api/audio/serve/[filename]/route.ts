import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const OUTPUTS_DIR = path.join(process.env.HOME || "", "SonicStudio", "outputs");

export async function GET(req: Request, { params }: { params: { filename: string } }) {
    const filename = params.filename;
    if (!filename) return new NextResponse("Filename required", { status: 400 });

    const filePath = path.join(OUTPUTS_DIR, filename);

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
