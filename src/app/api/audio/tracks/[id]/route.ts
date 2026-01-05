
import { NextResponse } from "next/server";
import { LibraryDB } from "@/lib/library/db";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        LibraryDB.delete(id);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
