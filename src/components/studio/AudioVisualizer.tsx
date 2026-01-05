"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    color?: string; // e.g. "cyan", "pink", "purple"
}

export function AudioVisualizer({ analyser, color = "cyan" }: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>();

    // Color map for the spectral bars
    const colors: Record<string, string> = {
        cyan: "#22d3ee",
        pink: "#f472b6",
        purple: "#a855f7",
        green: "#4ade80",
        amber: "#fbbf24"
    };

    const mainColor = colors[color] || colors.cyan;

    useEffect(() => {
        if (!analyser) return;

        const draw = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;

                // Cyberpunk Gradients
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, mainColor);
                gradient.addColorStop(1, "transparent");

                ctx.fillStyle = gradient;
                // Add a small gap
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }

            rafRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [analyser, mainColor]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={60}
            className="w-full h-full opacity-80"
        />
    );
}
