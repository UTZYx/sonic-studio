import { NextResponse } from "next/server";
import { ProjectStore } from "@/lib/projects/store";
import { Project } from "@/lib/projects/types";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
        const project = ProjectStore.load(id);
        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
        return NextResponse.json(project);
    } else {
        const list = ProjectStore.list();
        return NextResponse.json(list);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const project = body as Project;

        // Basic Validation
        if (!project.id || !project.name) {
            return NextResponse.json({ error: "Invalid Project Data" }, { status: 400 });
        }

        // Integrity Check
        project.modified = Date.now();

        ProjectStore.save(project);
        return NextResponse.json({ ok: true, id: project.id });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    ProjectStore.delete(id);
    return NextResponse.json({ ok: true });
}
