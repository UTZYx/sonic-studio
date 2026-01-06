"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Info, Cpu, Activity, Zap } from "lucide-react";

interface ParameterInspectorProps {
    activeParam: {
        label: string;
        value: string | number;
        description: string;
        technical: string;
    } | null;
}

export function ParameterInspector({ activeParam }: ParameterInspectorProps) {
    return (
        <div className="h-24 bg-black/40 rounded-2xl border border-white/5 p-4 relative overflow-hidden flex items-center">
             {/* Background Tech */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
             <div className="absolute right-0 top-0 p-4 opacity-10">
                <Cpu className="w-16 h-16 text-white rotate-12" />
             </div>

            <AnimatePresence mode="wait">
                {activeParam ? (
                    <motion.div
                        key={activeParam.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="relative z-10 w-full"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20">
                                {activeParam.label}
                            </span>
                            <span className="text-[10px] font-mono text-white">
                                {activeParam.value}
                            </span>
                        </div>
                        <h4 className="text-xs text-neutral-300 font-medium mb-1">{activeParam.description}</h4>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-neutral-500 uppercase">
                            <Zap className="w-3 h-3 text-purple-400" />
                            <span>Logic: {activeParam.technical}</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 flex items-center gap-4 opacity-50"
                    >
                        <div className="p-2 rounded-full bg-white/5 border border-white/5">
                            <Info className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                            <div className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">System Ready</div>
                            <div className="text-[10px] text-neutral-400">Interact with controls to inspect logic.</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
