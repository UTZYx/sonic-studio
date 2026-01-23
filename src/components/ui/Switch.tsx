"use client";

import { motion } from "framer-motion";
import { KeyboardEvent } from "react";

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    color?: "cyan" | "purple" | "red" | "yellow";
}

export function Switch({
    checked,
    onChange,
    label,
    description,
    color = "cyan"
}: SwitchProps) {

    // Map color prop to tailwind classes
    const colors = {
        cyan: "bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]",
        purple: "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]",
        red: "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]",
        yellow: "bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]",
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(!checked);
        }
    };

    return (
        <div
            className="flex flex-col items-center gap-2 cursor-pointer group outline-none rounded-xl focus-visible:ring-2 focus-visible:ring-white/50"
            onClick={() => onChange(!checked)}
            role="switch"
            aria-checked={checked}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label={label}
        >
            {/* The Physical Switch */}
            <div className={`
                w-12 h-16 rounded-lg border-2 transition-colors duration-200 relative overflow-hidden
                ${checked ? "border-white/20 bg-neutral-900" : "border-neutral-800 bg-black"}
            `}>
                {/* Background Glow */}
                <div className={`absolute inset-0 opacity-20 transition-opacity duration-300 ${checked ? `bg-${color}-500` : "bg-transparent"}`} />

                {/* The Toggle Actuator */}
                <motion.div
                    initial={false}
                    animate={{
                        y: checked ? "10%" : "50%",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`
                        absolute left-1 right-1 h-[45%] rounded bg-gradient-to-b from-neutral-700 to-neutral-800 border-t border-white/10 shadow-lg
                        flex items-center justify-center
                    `}
                >
                    {/* LED Indicator on Accuator */}
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${checked ? colors[color] : "bg-neutral-900 shadow-inner"}`} />
                </motion.div>
            </div>

            {/* Labels */}
            {(label || description) && (
                <div className="text-center" aria-hidden="true">
                    {label && <div className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${checked ? `text-${color}-400` : "text-neutral-500"}`}>{label}</div>}
                    {description && <div className="text-[10px] font-mono text-neutral-600">{description}</div>}
                </div>
            )}
        </div>
    );
}
