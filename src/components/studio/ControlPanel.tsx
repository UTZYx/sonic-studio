"use client";

import { Knob } from "@/components/ui/Knob";
import { Zap, Terminal, Activity } from "lucide-react";
import { VOICE_PRESETS } from "../../config/presets";
import { motion } from "framer-motion";
import { useState } from "react";
import { ParameterInspector } from "./ParameterInspector";
import { PulsingButton } from "./PulsingButton";

interface ControlPanelProps {
    prompt: string;
    setPrompt: (v: string) => void;
    mode: "voice" | "music" | "sfx";
    setMode: (m: "voice" | "music" | "sfx") => void;
    selectedVoice: string;
    setVoice: (v: string) => void;
    status: string;
    startJob: () => void;
    warmth: number;
    setWarmth: (v: number) => void;
    speed: number;
    setSpeed: (v: number) => void;
    duration: number;
    setDuration: (v: number) => void;
    instrumentalOnly?: boolean;
    setInstrumentalOnly?: (v: boolean) => void;
}

export function ControlPanel({ prompt, setPrompt, mode, setMode, selectedVoice, setVoice, status, startJob, warmth, setWarmth, speed, setSpeed, duration, setDuration, instrumentalOnly, setInstrumentalOnly }: ControlPanelProps) {
    const isGenerating = status === "submitting" || status === "processing" || status === "queued";
    const [activeInspector, setActiveInspector] = useState<any>(null);

    return (
        <div className="p-8 relative">
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                {/* Left Column: Mode & Params */}
                <div className="w-full md:w-32 flex flex-col gap-6 shrink-0">
                    <div>
                        <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.2em] mb-4 px-1">Neural Mode</div>
                        <div className="p-1 px-3 py-2 bg-white/5 rounded-2xl border border-white/5 text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">
                                {mode}
                            </span>
                        </div>
                        {mode === "music" && setInstrumentalOnly && (
                            <button
                                onClick={() => setInstrumentalOnly(!instrumentalOnly)}
                                className={`
                                    mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl border transition-all
                                    ${instrumentalOnly
                                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                                        : "bg-transparent border-white/5 text-neutral-600 hover:text-neutral-400"
                                    }
                                `}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${instrumentalOnly ? "bg-cyan-400 animate-pulse" : "bg-neutral-700"}`} />
                                <span className="text-[8px] font-bold uppercase tracking-widest">Instrumental</span>
                            </button>
                        )}

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between px-1">
                            <span className="text-[8px] font-mono text-neutral-600 uppercase">Provider</span>
                            <span className={`text-[8px] font-mono font-bold uppercase ${mode === "music" ? "text-green-400" : "text-amber-500"}`}>
                                {mode === "music" ? "HF (Free)" : "11Labs ($)"}
                            </span>
                        </div>
                    </div>

                    <div className="flex md:flex-col gap-6 items-center bg-white/5 py-4 rounded-2xl border border-white/5">
                        {(mode === "music" || mode === "sfx") && (
                            <Knob
                                label="SEC"
                                value={duration}
                                onChange={(v) => setDuration(Math.round(v))}
                                min={1}
                                max={30}
                                color="pink"
                                size={38}
                                onInteractionStart={() => setActiveInspector({
                                    label: "DURATION",
                                    value: `${duration}s`,
                                    description: "Temporal Window",
                                    technical: "Length of the generated audio frame"
                                })}
                                onInteractionEnd={() => setActiveInspector(null)}
                            />
                        )}

                        <Knob
                            label="WRM"
                            value={warmth}
                            onChange={setWarmth}
                            min={0}
                            max={1}
                            color="cyan"
                            size={38}
                            onInteractionStart={() => setActiveInspector({
                                label: "WARMTH",
                                value: warmth.toFixed(2),
                                description: "Sampling Temperature",
                                technical: "Randomness of distribution (0.0=Greedy, 1.0=Stochastic)"
                            })}
                            onInteractionEnd={() => setActiveInspector(null)}
                        />
                        <Knob
                            label="STY"
                            value={speed}
                            onChange={setSpeed}
                            min={0}
                            max={1}
                            color="purple"
                            size={38}
                            onInteractionStart={() => setActiveInspector({
                                label: "STYLE",
                                value: speed.toFixed(2),
                                description: "Top-K Selection",
                                technical: "Limits next token to K most likely candidates"
                            })}
                            onInteractionEnd={() => setActiveInspector(null)}
                        />
                    </div>
                </div>

                {/* Center Column: Terminal */}
                <div className="flex-1 flex flex-col gap-6">
                    <ParameterInspector activeParam={activeInspector} />

                    <div className="flex-1 min-h-[160px] bg-black/40 rounded-3xl border border-white/5 p-6 relative group flex flex-col focus-within:border-cyan-500/20 transition-all">
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-cyan-400/40" />
                                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.3em]">Descriptor Stream</span>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-neutral-800" />
                                <div className="w-1 h-1 rounded-full bg-neutral-800" />
                                <div className="w-1 h-1 rounded-full bg-neutral-800" />
                            </div>
                        </div>
                        <textarea
                            className="w-full flex-1 bg-transparent text-sm font-mono text-neutral-200 p-0 focus:outline-none resize-none placeholder:text-neutral-800 leading-relaxed noscroll"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="// Describe the sonic entity..."
                        />
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
                            <div className="flex gap-4">
                                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Neural Link v4.3</span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify({ prompt, mode, warmth, speed, duration }));
                                        alert("Neural Configuration Exported to Clipboard.");
                                    }}
                                    className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 uppercase underline decoration-cyan-500/30"
                                >
                                    Export Map
                                </button>
                            </div>
                            <span className="text-[9px] font-mono text-neutral-500">{prompt.length} / 1000 Tokens</span>
                        </div>
                    </div>

                    {mode === "voice" && (
                        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            {VOICE_PRESETS.map(preset => (
                                <button
                                    key={preset.id}
                                    onClick={() => setVoice(preset.id)}
                                    className={`
                                        px-4 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all
                                        ${selectedVoice === preset.id
                                            ? "bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                                            : "bg-white/5 border-white/5 text-neutral-500 hover:border-white/10 hover:text-neutral-300"
                                        }
                                    `}
                                >
                                    {preset.name.split(" // ")[1]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Execution */}
                <div className="w-full md:w-40 flex flex-col gap-6 shrink-0">
                    <div className="bg-white/5 px-5 py-4 rounded-[2rem] border border-white/5 flex flex-col items-center gap-3">
                        <span className="text-[9px] text-neutral-600 font-mono uppercase tracking-[0.2em]">Quality Profile</span>
                        <div className="flex gap-1.5">
                            {["ghost", "crisp", "studio"].map(p => (
                                <button
                                    key={p}
                                    onClick={() => {
                                        if (p === "ghost") { setWarmth(0.2); setSpeed(0.8); }
                                        if (p === "crisp") { setWarmth(0.8); setSpeed(0.4); }
                                        if (p === "studio") { setWarmth(0.5); setSpeed(0.5); }
                                    }}
                                    className={`w-3 h-3 rounded-full transition-all border ${(p === "ghost" && warmth < 0.4) || (p === "crisp" && warmth > 0.7) || (p === "studio" && warmth >= 0.4 && warmth <= 0.7)
                                        ? "bg-cyan-400 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                                        : "bg-transparent border-neutral-700 hover:border-neutral-500"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <PulsingButton
                        id="ignite-trigger"
                        onClick={startJob}
                        disabled={isGenerating}
                        trigger={`${warmth}-${speed}-${duration}-${prompt}`}
                        className={`
                            h-28 md:flex-1 w-full flex flex-col items-center justify-center gap-3 rounded-[2.5rem] transition-all duration-700 group/btn overflow-hidden relative border border-white/10
                            ${isGenerating
                                ? "bg-black/40 text-neutral-700 cursor-not-allowed"
                                : "bg-neutral-900 text-white hover:border-white/30"
                            }
                        `}
                    >
                        {!isGenerating && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-1000"
                            />
                        )}
                        <Zap className={`w-8 h-8 relative z-10 transition-transform duration-700 group-hover/btn:scale-125 group-hover/btn:rotate-12 ${isGenerating ? "animate-pulse" : "text-white"}`} />
                        <span className="font-black tracking-[0.3em] text-[10px] uppercase relative z-10">Ignite</span>
                        {!isGenerating && (
                            <span className="text-[7px] text-neutral-500 font-mono mt-1 opacity-0 group-hover/btn:opacity-100 transition-opacity">CMD+ENTER</span>
                        )}
                    </PulsingButton>
                </div>
            </div>
        </div>
    );
}
