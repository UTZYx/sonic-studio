export class SequenceEngine {
    private ctx: AudioContext;
    private sources: AudioBufferSourceNode[] = [];
    private gains: GainNode[] = []; // Track gain nodes for cleanup
    private isPlaying: boolean = false;

    constructor() {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    async loadAudio(url: string): Promise<AudioBuffer> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.ctx.decodeAudioData(arrayBuffer);
    }

    async playSequence(urls: string[], onProgress?: (index: number) => void, crossfadeDuration: number = 2.0) {
        if (this.ctx.state === 'suspended') await this.ctx.resume();
        this.stop();

        this.isPlaying = true;
        let startTime = this.ctx.currentTime + 0.1;

        const buffers = await Promise.all(urls.map(url => this.loadAudio(url)));

        buffers.forEach((buffer, index) => {
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;

            // Create Gain Node for Crossfading
            const gainNode = this.ctx.createGain();

            // Connect: Source -> Gain -> Destination
            source.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            // Determine effective crossfade (clamp to half duration to avoid overlap issues)
            const fade = Math.min(crossfadeDuration, buffer.duration / 2);

            // 1. Fade In (if not first track)
            if (index > 0) {
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(1, startTime + fade);
            } else {
                gainNode.gain.setValueAtTime(1, startTime);
            }

            // 2. Fade Out (if not last track)
            // The fade out should start at: start + duration - fade
            // And end at: start + duration
            if (index < buffers.length - 1) {
                const fadeOutStart = startTime + buffer.duration - fade;
                // Ensure we don't start fading out before we finished fading in
                const safeFadeOutStart = Math.max(fadeOutStart, startTime + fade);

                gainNode.gain.setValueAtTime(1, safeFadeOutStart);
                gainNode.gain.linearRampToValueAtTime(0, startTime + buffer.duration);
            }

            source.start(startTime);

            // Schedule Progress Callback
            // We use the start time for the callback
            const delayMs = (startTime - this.ctx.currentTime) * 1000;
            if (delayMs >= 0) {
                setTimeout(() => {
                    if (this.isPlaying && onProgress) onProgress(index);
                }, delayMs);
            }

            this.sources.push(source);
            this.gains.push(gainNode);

            // Calculate next start time (Overlap)
            // Next track starts early by 'fade' amount
            startTime += (buffer.duration - fade);
        });

        // Cleanup callback
        const totalDuration = startTime + (buffers.length > 0 ? (Math.min(crossfadeDuration, buffers[buffers.length-1].duration / 2)) : 0); // Logic slightly off here but roughly end
        // actually startTime is already the end of the last track minus fade?
        // Let's trace:
        // T1 (10s), fade 2.
        // Start 0. Next Start = 0 + 10 - 2 = 8.
        // T2 (10s). Start 8. Next Start = 8 + 10 - 2 = 16.
        // End of T2 is 8 + 10 = 18.
        // So last track end is `startTime (start of last)` + `duration`

        const lastBuffer = buffers[buffers.length - 1];
        const lastStart = startTime - (lastBuffer.duration - Math.min(crossfadeDuration, lastBuffer.duration/2)); // This is getting messy to calc back.
        // Easier: Just track the absolute end time.

        // Correct logic for end time:
        // The loop updates `startTime` to the *next* track's start.
        // So after the loop, `startTime` is effectively the start of "Track N+1" (which doesn't exist).
        // To get the actual end of playback, we look at the last track.
        // Last track started at `startTime - (lastBuffer.duration - fade)`.
        // It ends at `that_start + lastBuffer.duration`.
        // = `startTime - lastBuffer.duration + fade + lastBuffer.duration`
        // = `startTime + fade`.

        // Wait, loop:
        // i=0. start=0. next=8.
        // i=1. start=8. next=16.
        // End of loop. startTime=16.
        // Last track (i=1) starts at 8, len 10. Ends at 18.
        // 16 + 2 = 18.
        // So `startTime + fade` is the end.

        const finalEndTime = startTime + (buffers.length > 0 ? Math.min(crossfadeDuration, buffers[buffers.length-1].duration/2) : 0);

        setTimeout(() => {
            if (this.isPlaying && onProgress) onProgress(-1);
            this.isPlaying = false;
        }, (finalEndTime - this.ctx.currentTime) * 1000);
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
            this.gains.push(gainNode);
        }
    }

    stop() {
        this.isPlaying = false;
        this.sources.forEach(s => {
            try { s.stop(); } catch (e) { }
        });
        this.sources = [];
        // Gains don't need explicit stop, but good to clear array
        this.gains = [];
    }
}
