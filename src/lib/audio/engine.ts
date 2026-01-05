
export class AudioEngine {
    private ctx: AudioContext | null = null;
    private voiceNode: AudioBufferSourceNode | null = null;
    private musicNode: AudioBufferSourceNode | null = null;

    private voiceGain: GainNode | null = null;
    private musicGain: GainNode | null = null;
    private masterGain: GainNode | null = null;

    private voicePanner: StereoPannerNode | null = null;
    private musicPanner: StereoPannerNode | null = null;

    public analyser: AnalyserNode | null = null;

    constructor() {
        if (typeof window !== "undefined") {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (this.ctx) {
                this.voiceGain = this.ctx.createGain();
                this.musicGain = this.ctx.createGain();
                this.masterGain = this.ctx.createGain();

                this.voicePanner = this.ctx.createStereoPanner();
                this.musicPanner = this.ctx.createStereoPanner();

                this.analyser = this.ctx.createAnalyser();
                this.analyser.fftSize = 256;

                // Graph: Source -> Gain -> Panner -> Master -> Analyser -> Dest
                this.voiceGain.connect(this.voicePanner);
                this.voicePanner.connect(this.masterGain);

                this.musicGain.connect(this.musicPanner);
                this.musicPanner.connect(this.masterGain);

                this.masterGain.connect(this.analyser);
                this.analyser.connect(this.ctx.destination);
            }
        }
    }

    async loadTrack(url: string, type: "voice" | "music") {
        if (!this.ctx) return;
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        return { type, buffer: audioBuffer };
    }

    playMixed(voiceBuffer: AudioBuffer | null, musicBuffer: AudioBuffer | null) {
        if (!this.ctx) return;

        // Stop previous
        this.stop();

        const now = this.ctx.currentTime;

        if (voiceBuffer && this.voiceGain) {
            this.voiceNode = this.ctx.createBufferSource();
            this.voiceNode.buffer = voiceBuffer;
            this.voiceNode.connect(this.voiceGain);
            this.voiceNode.start(now);
        }

        if (musicBuffer && this.musicGain) {
            this.musicNode = this.ctx.createBufferSource();
            this.musicNode.buffer = musicBuffer;
            this.musicNode.connect(this.musicGain);
            this.musicNode.start(now);
        }
    }

    stop() {
        if (this.voiceNode) { try { this.voiceNode.stop(); } catch (e) { } this.voiceNode = null; }
        if (this.musicNode) { try { this.musicNode.stop(); } catch (e) { } this.musicNode = null; }
    }

    setVolume(type: "voice" | "music" | "master", val: number) {
        // val 0.0 to 1.0 (or higher)
        const target = type === "voice" ? this.voiceGain : type === "music" ? this.musicGain : this.masterGain;
        if (target && this.ctx) {
            target.gain.setTargetAtTime(val, this.ctx.currentTime, 0.01);
        }
    }

    setPan(type: "voice" | "music", val: number) {
        // val -1.0 (left) to 1.0 (right)
        const target = type === "voice" ? this.voicePanner : this.musicPanner;
        if (target && this.ctx) {
            target.pan.setTargetAtTime(val, this.ctx.currentTime, 0.01);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}
