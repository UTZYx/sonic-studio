import fs from "fs";
import path from "path";

// The Memory of the System
// V2: Use project-local data path for container persistence
const WEIGHTS_PATH = path.join(process.cwd(), "data", "synapse_weights.json");

interface SynapseMemory {
    genres: Record<string, number>;
    providers: Record<string, number>;
    moods: Record<string, number>;
}

const DEFAULT_MEMORY: SynapseMemory = {
    genres: {
        "cyberpunk": 0.5,
        "ambient": 0.5,
        "lofi": 0.5,
        "orchestral": 0.5
    },
    providers: {
        "local-gpu": 0.8, // Bias towards local
        "cloud-eleven": 0.5,
        "cloud-hf": 0.5
    },
    moods: {
        "dark": 0.5,
        "uplifting": 0.5,
        "neutral": 0.5
    }
};

export class Synapse {
    // Load Memory
    static load(): SynapseMemory {
        // Ensure dir exists
        const dir = path.dirname(WEIGHTS_PATH);
        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir, { recursive: true });
            } catch (e) {
                console.warn("[Synapse] Failed to create data dir:", e);
                return DEFAULT_MEMORY;
            }
        }

        if (!fs.existsSync(WEIGHTS_PATH)) {
            // Initialize
            try {
                fs.writeFileSync(WEIGHTS_PATH, JSON.stringify(DEFAULT_MEMORY, null, 2));
            } catch (e) {
                console.warn("[Synapse] Read-only filesystem? Using default memory.");
            }
            return DEFAULT_MEMORY;
        }

        try {
            return JSON.parse(fs.readFileSync(WEIGHTS_PATH, "utf-8"));
        } catch (e) {
            console.error("[Synapse] Memory Corruption detected. Resetting.", e);
            return DEFAULT_MEMORY;
        }
    }

    // Save Memory
    static save(mem: SynapseMemory) {
        try {
            fs.writeFileSync(WEIGHTS_PATH, JSON.stringify(mem, null, 2));
        } catch (e) {
            console.warn("[Synapse] Failed to save memory (Read-only?):", e);
        }
    }

    // Reinforce a pattern (Reward or Punish)
    static reinforce(tags: string[], provider: string | undefined, delta: number) {
        const mem = this.load();

        // 1. Reinforce Genres/Tags
        tags.forEach(tag => {
            const keys = Object.keys(mem.genres);
            // Simple fuzzy match or direct match
            // For now, we assume simple keys. TODO: improve normalization
            const key = keys.find(k => tag.toLowerCase().includes(k));
            if (key) {
                mem.genres[key] = Math.max(0.1, Math.min(1.0, (mem.genres[key] || 0.5) + delta));
                console.log(`[Synapse] Adjusted Gravity for '${key}': ${mem.genres[key].toFixed(2)}`);
            } else {
                // Learn new tag if significant positive reinforcement?
                if (delta > 0 && tag.length > 3) {
                    mem.genres[tag.toLowerCase()] = 0.6; // Initial learning
                    console.log(`[Synapse] Learned New Concept: '${tag}'`);
                }
            }
        });

        // 2. Reinforce Provider
        if (provider && mem.providers[provider]) {
            mem.providers[provider] = Math.max(0.1, Math.min(1.0, mem.providers[provider] + (delta * 0.5))); // Slower learning for infra
        }

        this.save(mem);
    }

    // Get a bias factor for a specific style (to boost probability)
    static getGravity(style: string): number {
        const mem = this.load();
        return mem.genres[style.toLowerCase()] || 0.5;
    }
}
