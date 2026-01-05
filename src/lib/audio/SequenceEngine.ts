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
        this.stop();

        this.isPlaying = true;
        let startTime = this.ctx.currentTime + 0.1;

        const buffers = await Promise.all(urls.map(url => this.loadAudio(url)));

        buffers.forEach((buffer, index) => {
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(this.ctx.destination);
            source.start(startTime);

            const delayMs = (startTime - this.ctx.currentTime) * 1000;
            setTimeout(() => {
                if (this.isPlaying && onProgress) onProgress(index);
            }, delayMs);

            this.sources.push(source);
            startTime += buffer.duration;
        });

        setTimeout(() => {
            if (this.isPlaying && onProgress) onProgress(-1);
            this.isPlaying = false;
        }, (startTime - this.ctx.currentTime) * 1000);
    }

    async playLayered(layers: { url: string; volume?: number; pan?: number }[]) {
        if (this.ctx.state === 'suspended') await this.ctx.resume();
        this.stop();

        this.isPlaying = true;
        const startTime = this.ctx.currentTime + 0.1;

        for (const layer of layers) {
            const buffer = await this.loadAudio(layer.url);
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;

            const gainNode = this.ctx.createGain();
            gainNode.gain.value = layer.volume ?? 1.0;

            const pannerNode = this.ctx.createStereoPanner();
            pannerNode.pan.value = layer.pan ?? 0.0;

            source.connect(gainNode);
            gainNode.connect(pannerNode);
            pannerNode.connect(this.ctx.destination);

            source.start(startTime);
            this.sources.push(source);
        }
    }

    stop() {
        this.isPlaying = false;
        this.sources.forEach(s => {
            try { s.stop(); } catch (e) { }
        });
        this.sources = [];
    }
}
