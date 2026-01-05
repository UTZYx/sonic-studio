export class SequenceEngine {
    private ctx: AudioContext;
    private sources: AudioBufferSourceNode[] = [];
    private isPlaying: boolean = false;

    constructor() {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    async loadAudio(url: string): Promise<AudioBuffer> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.ctx.decodeAudioData(arrayBuffer);
    }

    async playSequence(urls: string[], onProgress?: (index: number) => void) {
        if (this.ctx.state === 'suspended') await this.ctx.resume();
        this.stop(); // Clear previous

        this.isPlaying = true;
        let startTime = this.ctx.currentTime + 0.1; // Small buffer

        // Load all buffers first (High fidelity, pre-load approach)
        // For a pro sequencer, we might stream, but for <5 mins, loading is safer for gapless.
        const buffers = await Promise.all(urls.map(url => this.loadAudio(url)));

        buffers.forEach((buffer, index) => {
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(this.ctx.destination);

            source.start(startTime);

            // Schedule visual callback
            // (Note: setTimeout is less precise than WebAudio, but good enough for UI highlighting)
            const delayMs = (startTime - this.ctx.currentTime) * 1000;
            setTimeout(() => {
                if (this.isPlaying && onProgress) onProgress(index);
            }, delayMs);

            this.sources.push(source);
            startTime += buffer.duration;
        });

        // Auto-stop at end
        setTimeout(() => {
            if (this.isPlaying && onProgress) onProgress(-1); // Reset
            this.isPlaying = false;
        }, (startTime - this.ctx.currentTime) * 1000);
    }

    stop() {
        this.isPlaying = false;
        this.sources.forEach(s => {
            try { s.stop(); } catch (e) { }
        });
        this.sources = [];
    }
}
