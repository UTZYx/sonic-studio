export interface StyleNode {
    id: string;
    keywords: string[];
    layers: string[];
}

export const STYLE_MATRIX: StyleNode[] = [
    { id: "cyberpunk", keywords: ["cyberpunk", "neon", "sci-fi"], layers: ["Deep Saw Bass", "Vangelis Synth Pad", "Neon Arpeggio"] },
    { id: "synthwave", keywords: ["synthwave", "retro", "80s"], layers: ["Retro Drum Machine", "Analog Bass 16th Notes", "Dreamy Synth Leads"] },
    { id: "lofi", keywords: ["lofi", "chill", "study"], layers: ["Dusty Vinyl Crackle", "Mellow Rhodes Chords", "Slow Boom Bap Beat"] },
    { id: "hiphop", keywords: ["hiphop", "rap", "beat"], layers: ["Heavy Kick and Snare", "Sampled Jazz Loop", "Deep Sub Bass"] },
    { id: "trap", keywords: ["trap", "drill"], layers: ["Rattling Hi-Hats", "808 Glides", "Dark Minor Bells"] },
    { id: "ambient", keywords: ["ambient", "drone", "sleep"], layers: ["Ethereal Drone", "Soft Wind Texture", "Sparse Piano Droplets"] },
    { id: "meditation", keywords: ["meditation", "yoga", "zen"], layers: ["Tibetan Bowl Drone", "Slow Breathing Texture", "Soft Theta Waves"] },
    { id: "techno", keywords: ["techno", "rave", "warehouse"], layers: ["Rumbling Kick", "Industrial Hi-Hats", "Acid 303 Line"] },
    { id: "house", keywords: ["house", "dance", "club"], layers: ["Four-on-the-Floor Kick", "Piano House Chords", "Funky Bassline"] },
    { id: "dnb", keywords: ["dnb", "jungle", "drum and bass"], layers: ["Fast Breakbeat (174bpm)", "Reese Bass", "Atmospheric Pad"] },
    { id: "cinematic", keywords: ["cinematic", "movie", "score"], layers: ["Orchestral Swell", "Deep Braaam Impact", "Tension Strings"] },
    { id: "orchestral", keywords: ["orchestral", "symphony", "classical"], layers: ["Violin Section Staccato", "Brass Horn Blast", "Timpani Roll"] }
];
