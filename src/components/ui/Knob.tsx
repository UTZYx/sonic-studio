"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface KnobProps {
    min?: number;
    max?: number;
    value: number;
    onChange: (val: number) => void;
    label?: string;
    size?: number;
    color?: "cyan" | "purple" | "white" | "pink";
    onInteractionStart?: () => void;
    onInteractionEnd?: () => void;
    step?: number;
}

export function Knob({
    min = 0,
    max = 100,
    value,
    onChange,
    label,
    size = 64,
    color = "cyan",
    onInteractionStart,
    onInteractionEnd,
    step
}: KnobProps) {
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef<number>(0);
    const startVal = useRef<number>(0);
    const keyboardStep = step || (max - min) / 50;

    // Calculate rotation (-145deg to +145deg)
    const percentage = (value - min) / (max - min);
    const rotation = -145 + (percentage * 290);

    const handleMouseDown = (e: React.MouseEvent) => {
        onInteractionStart?.();
        setIsDragging(true);
        startY.current = e.clientY;
        startVal.current = value;
        document.body.style.cursor = "ns-resize";
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        const deltaY = startY.current - e.clientY;
        const range = max - min;
        // Sensitivity: 200px drag = full range
        const deltaVal = (deltaY / 200) * range;

        let newVal = startVal.current + deltaVal;
        newVal = Math.max(min, Math.min(max, newVal));

        onChange(newVal);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        onInteractionEnd?.();
        document.body.style.cursor = "default";
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const key = e.key;
        if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(key)) {
            e.preventDefault();
            if (!isDragging) {
                setIsDragging(true);
                onInteractionStart?.();
            }

            let delta = 0;
            if (key === 'ArrowUp' || key === 'ArrowRight') delta = keyboardStep;
            if (key === 'ArrowDown' || key === 'ArrowLeft') delta = -keyboardStep;

            const newVal = Math.min(max, Math.max(min, value + delta));
            onChange(newVal);
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent) => {
        if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(e.key)) {
            setIsDragging(false);
            onInteractionEnd?.();
        }
    };

    const getColor = () => {
        if (color === "cyan") return "#06b6d4";
        if (color === "purple") return "#a855f7";
        if (color === "pink") return "#ec4899";
        return "#fafafa";
    };

    return (
        <div className="flex flex-col items-center gap-2 group select-none">
            <div
                role="slider"
                aria-valuenow={value}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-label={label || "Knob"}
                tabIndex={0}
                className="relative flex items-center justify-center cursor-ns-resize focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-full"
                style={{ width: size, height: size }}
                onMouseDown={handleMouseDown}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
            >
                {/* Back Plate */}
                <div className="absolute inset-0 rounded-full bg-sonic-void border border-neutral-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"></div>

                {/* Tick Marks (Static) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                    <circle cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-neutral-600" />
                </svg>

                {/* The Knob Body */}
                <motion.div
                    className="absolute w-[80%] h-[80%] rounded-full bg-gradient-to-br from-neutral-800 to-black border border-white/5 shadow-lg"
                    style={{ rotate: rotation }}
                >
                    {/* Indicator Line */}
                    <div
                        className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-[40%] rounded-full transition-shadow duration-300"
                        style={{
                            backgroundColor: getColor(),
                            boxShadow: isDragging ? `0 0 10px ${getColor()}` : "none"
                        }}
                    ></div>
                </motion.div>
            </div>

            {/* Label & Value */}
            <div className="text-center">
                <div className="text-[10px] font-bold text-neutral-500 tracking-wider uppercase">{label}</div>
                <div className={`text-xs font-mono transition-colors ${isDragging ? `text-${color}-400` : "text-neutral-400"}`}>
                    {value.toFixed(1)}
                </div>
            </div>
        </div>
    );
}
