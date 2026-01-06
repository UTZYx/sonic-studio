export class ReflexEngine {
    private ctx: AudioContext;
    private masterGain: GainNode;
    private tracks: Map<string, {
        source: AudioBufferSourceNode | null;
        gain: GainNode;
        panner: StereoPannerNode;
        buffer: AudioBuffer | null;
        url: string;
    }>;
    private isPlaying: boolean = false;
    public analyser: AnalyserNode;

    constructor() {
        // Initialize Web Audio Context (System 1)
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();

        // Master Bus
        this.masterGain = this.ctx.createGain();
        this.analyser = this.ctx.createAnalyser();

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        this.tracks = new Map();
        console.log("[Reflex Engine] Initialized (System 1)");
    }

    /**
     * Loads a stem into the Reflex Engine.
     * This is an async operation (fetching data), but once loaded, mixing is instant.
     */
    async loadTrack(id: string, url: string) {
        if (this.tracks.has(id) && this.tracks.get(id)?.url === url) return; // Cache hit

        console.log(`[Reflex] Loading Stem: ${id} -> ${url}`);

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

            // Create Graph Nodes
            const gain = this.ctx.createGain();
            const panner = this.ctx.createStereoPanner();

            // Routing: Source -> Gain -> Panner -> Master
            gain.connect(panner);
            panner.connect(this.masterGain);

            this.tracks.set(id, {
                source: null,
                gain,
                panner,
                buffer: audioBuffer,
                url
            });
            console.log(`[Reflex] Stem ${id} Ready.`);
        } catch (e) {
            console.error(`[Reflex] Failed to load stem ${id}:`, e);
        }
    }

    /**
     * Returns all loaded tracks for offline rendering/bouncing.
     */
    getAllTracks() {
        // Convert Map to Array of objects with ID and configuration
        return Array.from(this.tracks.entries()).map(([id, track]) => ({
            id,
            buffer: track.buffer,
            volume: track.gain.gain.value,
            pan: track.panner.pan.value
        }));
    }

    /**
     * Instant Volume Control (Physics of Sound)
     * @param id Track ID
     * @param value 0.0 to 1.0
     */
    setVolume(id: string, value: number) {
        const track = this.tracks.get(id);
        if (track) {
            // Smooth transition to prevent clicks (50ms ramp)
            track.gain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.05);
        }
    }

    /**
     * Instant Pan Control (Spatial Hearing)
     * @param id Track ID
     * @param value -1.0 (Left) to 1.0 (Right)
     */
    setPan(id: string, value: number) {
        const track = this.tracks.get(id);
        if (track) {
            track.panner.pan.setTargetAtTime(value, this.ctx.currentTime, 0.05);
        }
    }

    /**
     * Ignite the Engine (Playback)
     * This triggers all loaded stems simultaneously.
     */
    play() {
        if (this.isPlaying) this.stop();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.tracks.forEach((track, id) => {
            if (!track.buffer) return;

            const source = this.ctx.createBufferSource();
            source.buffer = track.buffer;
            source.connect(track.gain); // Reconnect to the graph
            source.start(0);
            track.source = source;
        });

        this.isPlaying = true;
        console.log("[Reflex] Playback Started.");
    }

    /**
     * Stop the Engine
     */
    stop() {
        this.tracks.forEach((track) => {
            if (track.source) {
                try {
                    track.source.stop();
                } catch (e) { /* ignore if already stopped */ }
                track.source.disconnect();
                track.source = null;
            }
        });
        this.isPlaying = false;
        console.log("[Reflex] Playback Stopped.");
    }

    /**
     * Resume AudioContext (Browser Policy)
     */
    async resume() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }
}
