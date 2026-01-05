import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "masters.json");
const OUTPUTS_DIR = path.join(process.env.HOME || "", "SonicStudio", "outputs");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface MasterTrack {
    id: string; // usually filename for legacy compatibility, or UUID
    title: string;
    prompt?: string;
    url: string;
    size: number;
    created: number;
    type: "music" | "voice";
    jobId?: string;
}

// In-memory cache
let globalMasters: MasterTrack[] = [];

// Load from disk
try {
    if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, "utf-8");
        globalMasters = JSON.parse(data);
    } else {
        // Initial population from filesystem if DB is empty (migration)
        // We will do this lazily or explicitly? Let's do it once on startup if empty.
        // Actually, let's just leave it empty and let the 'sync' logic or manual addition handle it.
        // But for "fixing LibraryPanel list logic", we should probably ensure existing files are visible.
        // I'll implement a sync function.
    }
} catch (e) {
    console.error("Failed to load masters DB:", e);
    globalMasters = [];
}

const persist = () => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(globalMasters, null, 2));
    } catch (e) {
        console.error("Failed to persist masters DB:", e);
    }
};

export const MasterStore = {
    getAll: (): MasterTrack[] => {
        // Optional: Re-scan filesystem to find files not in DB?
        // For now, let's trust the DB, but maybe we should populate it if it's empty and files exist.
        if (globalMasters.length === 0 && fs.existsSync(OUTPUTS_DIR)) {
           MasterStore.syncWithFileSystem();
        }
        return globalMasters.sort((a, b) => b.created - a.created);
    },

    add: (track: MasterTrack) => {
        // Check if exists
        const exists = globalMasters.find(t => t.id === track.id || t.url === track.url);
        if (exists) return exists;

        globalMasters.push(track);
        persist();
        return track;
    },

    syncWithFileSystem: () => {
        try {
            if (!fs.existsSync(OUTPUTS_DIR)) return;
            const files = fs.readdirSync(OUTPUTS_DIR)
                .filter(f => f.endsWith(".wav") || f.endsWith(".mp3"));

            let changed = false;
            files.forEach(f => {
                const fullPath = path.join(OUTPUTS_DIR, f);
                const stats = fs.statSync(fullPath);

                // Check if already in DB
                // We use filename as ID for legacy/filesystem based tracks
                const exists = globalMasters.find(t => t.id === f || t.url.endsWith(f));
                if (!exists) {
                    // Try to read metadata sidecar
                    let prompt = "Generated Audio";
                    let jobId = undefined;
                    const metaPath = fullPath + ".json";
                    if (fs.existsSync(metaPath)) {
                        try {
                            const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
                            prompt = meta.prompt || prompt;
                            jobId = meta.id;
                        } catch (e) { }
                    }

                    const track: MasterTrack = {
                        id: f,
                        title: f,
                        prompt: prompt,
                        url: `/api/audio/serve/${f}`,
                        size: stats.size,
                        created: stats.birthtimeMs,
                        type: f.endsWith(".wav") ? "music" : "voice",
                        jobId
                    };
                    globalMasters.push(track);
                    changed = true;
                }
            });

            if (changed) persist();
        } catch (e) {
            console.error("Sync failed:", e);
        }
    }
};
