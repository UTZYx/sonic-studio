"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface FaderProps {
    min?: number;
    max?: number;
    value: number;
    onChange: (val: number) => void;
    label?: string;
    height?: number;
    color?: "cyan" | "purple";
}

export function Fader({
    min = 0,
    max = 100,
    value,
    onChange,
    label,
    height = 200,
    color = "cyan"
}: FaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    // Calculate position (0 = bottom, 1 = top)
    const percentage = (value - min) / (max - min);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        updateValueFromMouse(e.clientY);
        document.body.style.cursor = "ns-resize";
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        updateValueFromMouse(e.clientY);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        document.body.style.cursor = "default";
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    };

    const updateValueFromMouse = (clientY: number) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        // Calculate 0-1 from bottom to top
        const relativeY = rect.bottom - clientY;
        let p = relativeY / rect.height;
        p = Math.max(0, Math.min(1, p));

        const newValue = min + (p * (max - min));
        onChange(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const range = max - min;
        let step = 0;

        switch (e.key) {
            case "ArrowUp":
            case "ArrowRight":
                step = range * 0.05;
                break;
            case "ArrowDown":
            case "ArrowLeft":
                step = -range * 0.05;
                break;
            case "PageUp":
                step = range * 0.2;
                break;
            case "PageDown":
                step = -range * 0.2;
                break;
            case "Home":
                onChange(min);
                e.preventDefault();
                return;
            case "End":
                onChange(max);
                e.preventDefault();
                return;
            default:
                return;
        }

        const newValue = Math.min(max, Math.max(min, value + step));
        onChange(newValue);
        e.preventDefault();
    };

    const getColor = (opacity = 1) => {
        if (color === "cyan") return `rgba(6, 182, 212, ${opacity})`;
        return `rgba(168, 85, 247, ${opacity})`;
    };

    const ringColor = color === "cyan" ? "focus-visible:ring-cyan-500" : "focus-visible:ring-purple-500";

    return (
        <div className="flex flex-col items-center gap-4 group select-none">
            {/* Track */}
            <div
                ref={trackRef}
                className={`relative w-12 rounded-lg bg-neutral-950 border border-neutral-800 shadow-inner flex justify-center cursor-ns-resize focus-visible:outline-none focus-visible:ring-2 ${ringColor} focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950`}
                style={{ height }}
                onMouseDown={handleMouseDown}
                onKeyDown={handleKeyDown}
                role="slider"
                tabIndex={0}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value}
                aria-label={label || "Fader"}
                aria-orientation="vertical"
            >
                {/* Center Line */}
                <div className="absolute top-2 bottom-2 w-[1px] bg-neutral-800"></div>

                {/* Fill Level */}
                <div
                    className="absolute bottom-2 w-1 rounded-full transition-colors duration-100"
                    style={{
                        height: `${percentage * 90}%`,
                        backgroundColor: getColor(0.3),
                        boxShadow: `0 0 10px ${getColor(0.2)}`
                    }}
                />

                {/* The Cap */}
                <motion.div
                    className="absolute w-8 h-12 rounded bg-gradient-to-b from-neutral-700 to-black border border-white/10 shadow-xl flex items-center justify-center z-10"
                    style={{ bottom: `${percentage * (height - 48)}px` }} // substract cap height
                    animate={{ scale: isDragging ? 1.05 : 1 }}
                >
                    {/* Grip Lines */}
                    <div className="space-y-[2px] w-4">
                        <div className="h-[1px] bg-neutral-500"></div>
                        <div className="h-[1px] bg-neutral-500"></div>
                        <div className="h-[1px] bg-neutral-500"></div>
                    </div>
                </motion.div>
            </div>

            {/* Label & Value */}
            <div className="text-center">
                <div className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">{label}</div>
                <div className={`text-xs font-mono transition-colors ${isDragging ? `text-${color}-400` : "text-neutral-400"}`}>
                    {(value * 100).toFixed(0)}%
                </div>
            </div>
        </div>
    );
}
