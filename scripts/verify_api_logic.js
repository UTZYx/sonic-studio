const fs = require('fs');
const path = require('path');

const OUTPUTS_DIR = path.join(process.env.HOME || "", "SonicStudio", "outputs");

function getTracks() {
    try {
        const files = fs.readdirSync(OUTPUTS_DIR)
            .filter(f => f.endsWith(".wav") || f.endsWith(".mp3"));

        const tracks = files.map(f => {
            const fullPath = path.join(OUTPUTS_DIR, f);
            const stats = fs.statSync(fullPath);

            // Updated Logic
            let prompt = null;
            const metaPath = fullPath + ".json";
            if (fs.existsSync(metaPath)) {
                try {
                    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
                    // Ensure we have a string
                    if (meta.prompt && typeof meta.prompt === 'string') {
                        prompt = meta.prompt;
                    }
                } catch (e) {
                    // Ignore corrupted sidecar files
                }
            }

            return {
                id: f,
                title: f,
                prompt: prompt,
            };
        });

        console.log(JSON.stringify(tracks, null, 2));
    } catch (e) {
        console.error(e);
    }
}

getTracks();
