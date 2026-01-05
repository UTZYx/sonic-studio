import { NextResponse } from "next/server";
import { Synapse } from "@/lib/orchestrator/synapse";

export async function GET() {
    try {
        const memory = Synapse.load();
        return NextResponse.json({ memory });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
