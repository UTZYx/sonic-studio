"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, Zap, Ghost, Database } from "lucide-react";
import { useEffect, useState } from "react";

interface NodeState {
    id: string;
    name: string;
    status: string;
    load: number;
    icon: any;
}

interface NeuralNodeMonitorProps {
    pulse: boolean;
    activeNode: "idle" | "voice" | "music" | "sfx";
    provider?: "local-gpu" | "cloud-eleven" | "cloud-hf";
}

export function NeuralNodeMonitor({ pulse, activeNode, provider }: NeuralNodeMonitorProps) {
    const [nodes, setNodes] = useState<NodeState[]>([
        { id: "core", name: "CORe", status: "active", load: 12, icon: Activity },
        { id: "voice", name: "VOX-NET", status: "idle", load: 0, icon: Activity },
        { id: "music", name: "SONIC-GRID", status: "idle", load: 0, icon: Zap },
        { id: "orchestra", name: "ORCHESTRA", status: "OFFLINE", load: 0, icon: ShieldCheck },
        { id: "sfx", name: "MATTER-GEN", status: "idle", load: 0, icon: Ghost },
        // { id: "guard", name: "GUARD", status: "active", load: 2, icon: ShieldCheck },
        { id: "archive", name: "ARCHIVE", status: "idle", load: 0, icon: Database },
    ]);

    // Live Neural Bridge Connection
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const checkBridge = async () => {
            if (activeNode === 'music' && provider === 'local-gpu') {
                try {
                    const res = await fetch("http://localhost:8000/health");
                    const data = await res.json();

                    setNodes(prev => prev.map(n => {
                        if (n.id === 'music') {
                            return {
                                ...n,
                                status: `GPU: ${data.vram_free || 'Active'}`,
                                load: 85 // High load when active
                            };
                        }
                        return n;
                    }));
                } catch (e) {
                    setNodes(prev => prev.map(n => {
                        if (n.id === 'music') {
                            return { ...n, status: "OFFLINE", load: 0 };
                        }
                        return n;
                    }));
                }
            } else {
                // Simulation Fallback for other modes
                setNodes(prev => prev.map(node => {
                    if (node.id === activeNode) {
                        return { ...node, status: "active", load: Math.floor(Math.random() * 30) + 60 };
                    }
                    if (node.id === "core") return { ...node, load: Math.floor(Math.random() * 20) + 10 };
                    return { ...node, status: "idle", load: 0 };
                }));
            }
        };

        if (activeNode === 'music' && provider === 'local-gpu') {
            checkBridge(); // Initial check
            interval = setInterval(checkBridge, 2000); // Poll every 2s
        } else {
            // Run simulation logic once
            checkBridge();
        }

        return () => clearInterval(interval);
    }, [pulse, activeNode, provider]);

    // Synapse Memory
    const [synapseTop3, setSynapseTop3] = useState<string[]>([]);

    useEffect(() => {
        const fetchSynapse = async () => {
            try {
                const res = await fetch("/api/synapse/weights");
                const data = await res.json();
                if (data.memory && data.memory.genres) {
                    // Sort genres by weight
                    const sorted = Object.entries(data.memory.genres)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 3)
                        .map(([k, v]) => `${k} (${((v as number) * 100).toFixed(0)}%)`);
                    setSynapseTop3(sorted);
                }
            } catch (e) {
                console.error("Synapse Fetch Error", e);
            }
        };
        fetchSynapse();
        // Poll infrequently
        const interval = setInterval(fetchSynapse, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activeNode !== 'idle' ? 'bg-purple-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Neural Node Monitor</h3>
                </div>
                <span className="text-[9px] font-mono text-neutral-700 uppercase">Sector: 0xUTZY</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {nodes.map(node => (
                    <div key={node.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${node.status === 'active' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-neutral-900 text-neutral-700'}`}>
                                <node.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-neutral-300 tracking-widest uppercase">{node.name}</div>
                                <div className="text-[8px] font-mono text-neutral-600 uppercase mt-0.5">{node.status}</div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-1">
                                {[...Array(10)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            opacity: (i / 10) < (node.load / 100) ? 1 : 0.1,
                                            backgroundColor: (i / 10) < (node.load / 100) ? "#22d3ee" : "#262626"
                                        }}
                                        className="w-1.5 h-1.5 rounded-full"
                                    />
                                ))}
                            </div>
                            <span className="text-[8px] font-mono text-neutral-800 uppercase">Load: {node.load}%</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-white/5">
                <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-neutral-600 uppercase">Active Synapses</span>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Memory Matrix</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {synapseTop3.length > 0 ? synapseTop3.map((s, i) => (
                            <span key={i} className="text-[9px] font-mono text-cyan-400/80 uppercase">{s}</span>
                        )) : <span className="text-[9px] font-mono text-neutral-800 uppercase">Calibrating...</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
