
import { NextResponse } from "next/server";
import { JobStore } from "@/lib/jobs/store";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const job = JobStore.get(params.id);

    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
}
