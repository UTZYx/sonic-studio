"use client";

import { motion } from "framer-motion";
import { Mic, Music, Sparkles } from "lucide-react";

interface ModeSelectorProps {
    mode: "voice" | "music" | "sfx";
    setMode: (m: "voice" | "music" | "sfx") => void;
}

const MODES = [
    { id: "voice", label: "Voice", icon: Mic, color: "bg-cyan-400" },
    { id: "sfx", label: "SFX", icon: Sparkles, color: "bg-emerald-400" },
    { id: "music", label: "Music", icon: Music, color: "bg-pink-400" },
] as const;

export function ModeSelector({ mode, setMode }: ModeSelectorProps) {
    return (
        <div className="flex items-center justify-center mb-8">
            <div className="flex gap-2 p-1.5 bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PHBhdGggZD0iTTAgOEw4IDAiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')] opacity-20 pointer-events-none" />

                {MODES.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id as any)}
                        aria-label={`Switch to ${m.label} mode`}
                        title={`Activate ${m.label} Neural Engine`}
                        className={`
                            relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 group
                            ${mode === m.id
                                ? "text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                            }
                        `}
                    >
                        {mode === m.id && (
                            <motion.div
                                layoutId="activeMode"
                                className={`absolute inset-0 ${m.color} rounded-xl`}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <m.icon className={`w-3 h-3 ${mode === m.id ? "text-black" : "text-neutral-600 group-hover:text-neutral-400"}`} />
                            {m.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
