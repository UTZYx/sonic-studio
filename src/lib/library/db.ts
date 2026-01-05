
import fs from "fs";
import path from "path";
import { Track } from "./types";

const DB_FILE = path.join(process.cwd(), "sonic-library.json");

// Ensure DB file exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ tracks: [] }, null, 2));
}

interface Schema {
    tracks: Track[];
}

export const LibraryDB = {
    isValid: () => fs.existsSync(DB_FILE),

    getAll: (): Track[] => {
        try {
            const data = fs.readFileSync(DB_FILE, "utf-8");
            const json: Schema = JSON.parse(data);
            // Sort by newest first
            return json.tracks.sort((a, b) => b.createdAt - a.createdAt);
        } catch (e) {
            console.error("DB Read Error", e);
            return [];
        }
    },

    add: (track: Track) => {
        try {
            const all = LibraryDB.getAll();
            all.push(track);
            fs.writeFileSync(DB_FILE, JSON.stringify({ tracks: all }, null, 2));
            return track;
        } catch (e) {
            console.error("DB Write Error", e);
            throw e;
        }
    },

    // Helper to convert a Job result into a Track
    saveJobAsTrack: (job: any, title?: string): Track => {
        if (job.status !== "completed" || !job.result) {
            throw new Error("Job not completed");
        }

        // Enterprise Upgrade: Save asset to disk instead of bloating JSON
        let storageUrl = job.result.url;

        if (storageUrl && storageUrl.startsWith("data:")) {
            try {
                // Parse Data URI
                const matches = storageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const mimeType = matches[1];
                    const buffer = Buffer.from(matches[2], "base64");

                    // Determine extension
                    const ext = mimeType.includes("wav") ? "wav" : "mp3";
                    const filename = `${job.id}.${ext}`;
                    const publicPath = path.join(process.cwd(), "public", "library", filename);

                    const libDir = path.dirname(publicPath);
                    if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });

                    fs.writeFileSync(publicPath, buffer);

                    storageUrl = `/library/${filename}`;
                    console.log(`[Library] Saved asset to ${publicPath} (Mime: ${mimeType})`);
                }
            } catch (e) {
                console.error("Failed to save asset to disk", e);
            }
        }

        const track: Track = {
            id: job.id,
            type: job.type || "tts",
            title: title || job.input.prompt?.slice(0, 30) || "Untitled Track",
            prompt: job.input.text || job.input.prompt || "",
            voiceId: job.input.voiceId,
            tags: ["Spike", job.type || "tts"],
            settings: job.input.settings,
            createdAt: Date.now(),
            assets: [
                {
                    id: `${job.id}-asset`,
                    trackId: job.id,
                    storageUrl: storageUrl,
                    mimeType: storageUrl.endsWith(".wav") ? "audio/wav" : "audio/mpeg",
                    byteLength: job.result.metadata?.byte_length || 0,
                    createdAt: Date.now(),
                }
            ]
        };

        return LibraryDB.add(track);
    },

    delete: (id: string) => {
        try {
            const all = LibraryDB.getAll();
            const track = all.find(t => t.id === id);

            if (track) {
                // Delete assets from disk
                track.assets.forEach(asset => {
                    if (asset.storageUrl.startsWith("/library/")) {
                        const filename = path.basename(asset.storageUrl);
                        const filePath = path.join(process.cwd(), "public", "library", filename);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log(`[Library] Deleted asset: ${filePath}`);
                        }
                    }
                });

                const filtered = all.filter(t => t.id !== id);
                fs.writeFileSync(DB_FILE, JSON.stringify({ tracks: filtered }, null, 2));
            }
        } catch (e) {
            console.error("DB Delete Error", e);
            throw e;
        }
    }
};
