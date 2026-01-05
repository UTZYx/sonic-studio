"use client";

import { motion } from "framer-motion";
import { Info, Sparkles, Music, Volume2, HelpCircle, Terminal, Cpu } from "lucide-react";

export function HelpPanel() {
    return (
        <div className="p-8 space-y-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                        <Cpu className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-widest uppercase">Engine Specifications</h2>
                        <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.3em] mt-1">UTZYx Neural Mesh v4.2.0</p>
                    </div>
                </div>
                <div className="hidden md:block text-right">
                    <span className="text-[9px] font-mono text-neutral-700 uppercase tracking-widest">Protocol: 0x88 // ACTIVE</span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
                {/* Voice Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/5 flex items-center justify-center border border-cyan-500/10">
                            <Volume2 className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="text-xs font-black text-neutral-200 uppercase tracking-widest">V-TTS Core</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
                        High-fidelity neural synthesis. Optimized for cinematic prosody and character depth.
                        Powered by ElevenLabs Multilingual Architecture.
                    </p>
                    <div className="flex flex-col gap-2">
                        <div className="text-[9px] font-mono text-neutral-700 flex justify-between">
                            <span>LATENCY</span>
                            <span className="text-cyan-600">~2.4s</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="w-[80%] h-full bg-cyan-500/30" />
                        </div>
                    </div>
                </div>

                {/* SFX Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/5 flex items-center justify-center border border-purple-500/10">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-xs font-black text-neutral-200 uppercase tracking-widest">SFX Engine</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
                        Procedural soundscape generation. Describe physical properties or environments
                        to manifest complex sonic artifacts.
                    </p>
                    <div className="flex flex-col gap-2">
                        <div className="text-[9px] font-mono text-neutral-700 flex justify-between">
                            <span>PRECISION</span>
                            <span className="text-purple-600">HIGH</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="w-[60%] h-full bg-purple-500/30" />
                        </div>
                    </div>
                </div>

                {/* Music Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/5 flex items-center justify-center border border-pink-500/10">
                            <Music className="w-4 h-4 text-pink-400" />
                        </div>
                        <span className="text-xs font-black text-neutral-200 uppercase tracking-widest">Composition</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
                        Generative orchestration mapping prompts to tonal influences.
                        Use the STY knob to tune prompt-adherence intensity.
                    </p>
                    <div className="flex flex-col gap-2">
                        <div className="text-[9px] font-mono text-neutral-700 flex justify-between">
                            <span>COMPLEXITY</span>
                            <span className="text-pink-600">MAX</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="w-[95%] h-full bg-pink-500/30" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                <div className="flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 group hover:border-cyan-500/30 transition-all">
                    <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                    <div>
                        <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Neural Warmth</h4>
                        <p className="text-[10px] text-neutral-600 leading-relaxed mt-2 uppercase font-bold tracking-tighter">
                            Controls the stability of the neural mesh. Lower values introduce higher entropy and creative unpredictability.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 group hover:border-purple-500/30 transition-all">
                    <Terminal className="w-5 h-5 text-purple-400 shrink-0 mt-1" />
                    <div>
                        <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Descriptor Influence</h4>
                        <p className="text-[10px] text-neutral-600 leading-relaxed mt-2 uppercase font-bold tracking-tighter">
                            Adjusts the adherence to the descriptive stream. High influence ensures strict mapping to the textual entity.
                        </p>
                    </div>
                </div>
            </div>

            {/* Future Waves Section */}
            <div className="pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Roadmap // Future Waves 2025</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-[9px] font-black text-pink-400 uppercase tracking-widest mb-2">Agentic Orchestration</div>
                        <p className="text-[10px] text-neutral-500 leading-relaxed font-mono">
                            Deploying autonomous &apos;Runners&apos; that can self-generate variations based on ambient listener feedback.
                        </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-2">Phase 10: Sonic Timeline</div>
                        <p className="text-[10px] text-neutral-500 leading-relaxed font-mono">
                            A new &quot;Sequencer&quot; mode allowing granular control over Intro, Verse, and Chorus blocks.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
