import { TimelineSegment } from "@/components/studio/Timeline/types";

export interface ProjectMeta {
    id: string;
    name: string;
    created: number;
    modified: number;
    author: string;
    version: number; // Schema version
}

export interface Project extends ProjectMeta {
    timeline: TimelineSegment[];
    globalSettings: {
        tempo: number;
        prompt: string;
        mode: "voice" | "music" | "sfx";
    };
}
