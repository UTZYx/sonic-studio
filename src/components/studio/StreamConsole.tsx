"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Activity, AlertCircle, CheckCircle2, Cpu } from "lucide-react";

interface StreamConsoleProps {
    logs: string[];
}

export function StreamConsole({ logs }: StreamConsoleProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    const parseLog = (log: string) => {
        // Extract timestamp if present [HH:MM:SS AM]
        const timeMatch = log.match(/^\[(.*?)\]\s(.*)/);
        const timestamp = timeMatch ? timeMatch[1] : "";
        const message = timeMatch ? timeMatch[2] : log;

        let type: "system" | "error" | "success" | "process" | "default" = "default";
        if (message.includes("Error") || message.includes("Failed")) type = "error";
        else if (message.includes("Saved") || message.includes("Loaded") || message.includes("Ready")) type = "success";
        else if (message.includes("Submitting") || message.includes("Igniting") || message.includes("Status")) type = "process";
        else if (message.includes("[System]")) type = "system";

        return { timestamp, message, type };
    };

    return (
        <div className="h-full flex flex-col relative overflow-hidden bg-black/40">
             {/* Glass/Scanline Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-cyan-500" />
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">Neural Uplink</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
                    <div className="w-1 h-1 rounded-full bg-cyan-500/20" />
                </div>
            </div>

            {/* Log Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 noscroll relative z-0">
                <AnimatePresence initial={false}>
                    {logs.map((rawLog, i) => {
                        const { timestamp, message, type } = parseLog(rawLog);

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="flex gap-3 group items-start font-mono text-[10px]"
                            >
                                <span className="text-neutral-500 shrink-0 select-none w-14 text-right opacity-70">{timestamp.split(" ")[0]}</span>

                                <div className="flex-1 flex gap-2 items-start break-all">
                                    <span className="mt-0.5 shrink-0">
                                        {type === "error" && <AlertCircle className="w-3 h-3 text-red-500" />}
                                        {type === "success" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                        {type === "process" && <Activity className="w-3 h-3 text-purple-400" />}
                                        {type === "system" && <Cpu className="w-3 h-3 text-cyan-500" />}
                                        {type === "default" && <span className="w-3 h-3 block border-l border-neutral-800" />}
                                    </span>

                                    <span className={`
                                        leading-relaxed
                                        ${type === "error" ? "text-red-400" : ""}
                                        ${type === "success" ? "text-emerald-300" : ""}
                                        ${type === "process" ? "text-purple-300" : ""}
                                        ${type === "system" ? "text-cyan-300" : ""}
                                        ${type === "default" ? "text-neutral-400" : ""}
                                    `}>
                                        {message.replace("[System] ", "")}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>

            {/* Empty State */}
            {logs.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600 pointer-events-none">
                    <Activity className="w-8 h-8 mb-2 opacity-30" />
                    <span className="text-[9px] uppercase tracking-widest opacity-60">Awaiting Signal...</span>
                </div>
            )}
        </div>
    );
}
