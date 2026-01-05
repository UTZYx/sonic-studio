import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

// Enterprise-grade persistence layer
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "jobs.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export type JobStatus = "queued" | "processing" | "completed" | "failed" | "failed_quota";

export interface AudioJob {
    id: string;
    type: "tts" | "music" | "sfx";
    input: {
        text?: string;
        prompt?: string;
        voiceId?: string;
        duration?: number;
        provider?: string;
        layers?: any[];
        settings?: {
            warmth?: number;
            speed?: number;
            instrumentalOnly?: boolean;
        };
    };
    status: JobStatus;
    result?: {
        url?: string;
        metadata?: any;
    };
    error?: string;
    createdAt: number;
    updatedAt: number;
}

// Load jobs from disk or initialize empty
let globalJobs: Record<string, AudioJob> = {};

try {
    if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, "utf-8");
        globalJobs = JSON.parse(data);
    }
} catch (e) {
    console.error("Failed to load jobs DB:", e);
    globalJobs = {};
}

const persist = () => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(globalJobs, null, 2));
    } catch (e) {
        console.error("Failed to persist jobs DB:", e);
    }
};

export const JobStore = {
    getAll: (): AudioJob[] => {
        return Object.values(globalJobs).sort((a, b) => b.createdAt - a.createdAt);
    },

    create: (type: AudioJob["type"], input: AudioJob["input"]): AudioJob => {
        const id = uuidv4();
        const job: AudioJob = {
            id,
            type,
            input,
            status: "queued",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        globalJobs[id] = job;
        persist();
        return job;
    },

    get: (id: string): AudioJob | null => {
        return globalJobs[id] || null;
    },

    update: (id: string, updates: Partial<AudioJob>) => {
        if (globalJobs[id]) {
            globalJobs[id] = {
                ...globalJobs[id],
                ...updates,
                updatedAt: Date.now()
            };
            persist();
        }
    },
};
