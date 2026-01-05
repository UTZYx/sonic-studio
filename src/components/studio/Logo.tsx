"use client";

import { motion } from "framer-motion";

export function Logo() {
    return (
        <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-10 h-10 flex items-center justify-center">
                {/* Ambient Glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-cyan-500 rounded-full blur-xl"
                />

                <svg viewBox="0 0 40 40" className="w-full h-full relative z-10">
                    <defs>
                        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="50%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>

                    {/* The Sparkle/Signal Hybrid Shape */}
                    <motion.path
                        d="M20 5 L22 18 L35 20 L22 22 L20 35 L18 22 L5 20 L18 18 Z"
                        fill="url(#logoGrad)"
                        initial={{ scale: 0.8, rotate: -45 }}
                        whileHover={{ scale: 1.1, rotate: 0 }}
                    />

                    <motion.path
                        d="M10 20 Q 15 10 20 20 T 30 20"
                        stroke="white"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.6"
                        animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scaleY: [1, 1.3, 1],
                            pathLength: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </svg>
            </div>

            <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-100 to-white leading-none">
                    UTZYx
                </span>
                <span className="text-[10px] font-mono tracking-[0.2em] text-cyan-400 uppercase font-bold text-glow-cyan">
                    Sonic Space
                </span>
            </div>
        </div>
    );
}
