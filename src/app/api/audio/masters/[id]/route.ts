import { NextResponse } from "next/server";
import { MasterStore } from "@/lib/masters/store";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const success = MasterStore.delete(id);

    if (success) {
        return NextResponse.json({ ok: true });
    } else {
        return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }
}
