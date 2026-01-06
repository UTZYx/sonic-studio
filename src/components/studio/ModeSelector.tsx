"use client";

import { motion } from "framer-motion";

interface ModeSelectorProps {
    mode: "voice" | "music" | "sfx";
    setMode: (m: "voice" | "music" | "sfx") => void;
}

export function ModeSelector({ mode, setMode }: ModeSelectorProps) {
    return (
        <div className="flex items-center justify-center mb-8">
            <div className="flex gap-2 p-1.5 bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                {["voice", "sfx", "music"].map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m as any)}
                        aria-label={`Switch to ${m} mode`}
                        className={`
                            relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300
                            ${mode === m
                                ? "text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                            }
                        `}
                    >
                        {mode === m && (
                            <motion.div
                                layoutId="activeMode"
                                className="absolute inset-0 bg-white rounded-xl"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{m}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
