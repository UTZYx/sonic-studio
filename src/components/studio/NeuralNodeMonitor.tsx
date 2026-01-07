"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldCheck, Zap, Ghost, Database, Cpu } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

interface NodeState {
    id: string;
    name: string;
    status: string;
    load: number;
    icon: any;
    x: number;
    y: number;
    color: string;
}

interface NeuralNodeMonitorProps {
    pulse: boolean;
    activeNode: "idle" | "voice" | "music" | "sfx";
    provider?: "local-gpu" | "cloud-eleven" | "cloud-hf";
}

// Coordinate System for 400x300 SVG
const CENTER = { x: 200, y: 150 };

export function NeuralNodeMonitor({ pulse, activeNode, provider }: NeuralNodeMonitorProps) {
    const [nodes, setNodes] = useState<NodeState[]>([
        { id: "core", name: "CORe", status: "active", load: 12, icon: Cpu, x: CENTER.x, y: CENTER.y, color: "text-white" },
        { id: "voice", name: "VOX", status: "idle", load: 0, icon: Activity, x: 100, y: 80, color: "text-cyan-400" },
        { id: "music", name: "GRID", status: "idle", load: 0, icon: Zap, x: 300, y: 80, color: "text-purple-400" },
        { id: "sfx", name: "MATTER", status: "idle", load: 0, icon: Ghost, x: 100, y: 220, color: "text-emerald-400" },
        { id: "archive", name: "MEM", status: "idle", load: 0, icon: Database, x: 300, y: 220, color: "text-yellow-400" },
    ]);

    // Live Neural Bridge Connection
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const checkBridge = async () => {
            // Local GPU Logic
            if (activeNode === 'music' && provider === 'local-gpu') {
                try {
                    const res = await fetch("http://localhost:8000/health");
                    if (!res.ok) throw new Error("Offline");
                    const data = await res.json();

                    setNodes(prev => prev.map(n => {
                        if (n.id === 'music') {
                            return {
                                ...n,
                                status: `VRAM: ${data.vram_allocated || 'Active'}`,
                                load: data.active_model ? 85 : 10
                            };
                        }
                        if (n.id === 'sfx') {
                            return {
                                ...n,
                                status: data.active_model === 'sfx' ? 'ACTIVE' : 'IDLE',
                                load: data.active_model === 'sfx' ? 85 : 0
                            };
                        }
                        if (n.id === 'core') return { ...n, load: 45 }; // Core active during generation
                        return n;
                    }));
                } catch (e) {
                    setNodes(prev => prev.map(n => {
                        if (n.id === 'music') return { ...n, status: "OFFLINE", load: 0 };
                        return n;
                    }));
                }
            } else {
                // Simulation Logic
                setNodes(prev => prev.map(node => {
                    const isActive = node.id === activeNode;

                    if (node.id === "core") {
                        // Core is always humming, more if active
                        return { ...node, load: activeNode !== 'idle' ? 65 : 15 };
                    }

                    if (isActive) {
                        return { ...node, status: "ACTIVE", load: Math.floor(Math.random() * 20) + 70 };
                    }

                    // Archive occasionally pulses
                    if (node.id === 'archive' && Math.random() > 0.9) {
                         return { ...node, load: 30 };
                    }

                    return { ...node, status: "IDLE", load: 0 };
                }));
            }
        };

        if (activeNode === 'music' && provider === 'local-gpu') {
            checkBridge();
            interval = setInterval(checkBridge, 2000);
        } else {
            checkBridge();
            interval = setInterval(checkBridge, 1000); // Simulate faster
        }

        return () => clearInterval(interval);
    }, [pulse, activeNode, provider]);

    // Synapse Memory
    const [synapseTop3, setSynapseTop3] = useState<string[]>([]);
    const [vram, setVram] = useState<string>("0 MB");

    useEffect(() => {
        // Extract VRAM from music node status for footer
        const musicNode = nodes.find(n => n.id === 'music');
        if (musicNode && musicNode.status.startsWith("VRAM")) {
            setVram(musicNode.status.split(": ")[1]);
        }
    }, [nodes]);

    useEffect(() => {
        const fetchSynapse = async () => {
            try {
                const res = await fetch("/api/synapse/weights");
                const data = await res.json();
                if (data.memory && data.memory.genres) {
                    const sorted = Object.entries(data.memory.genres)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 3)
                        .map(([k, v]) => `${k} (${((v as number) * 100).toFixed(0)}%)`);
                    setSynapseTop3(sorted);
                }
            } catch (e) {
                // console.error("Synapse Fetch Error", e);
            }
        };
        fetchSynapse();
    }, []);

    // SVG Rendering Helper
    const core = nodes.find(n => n.id === "core")!;
    const satellites = nodes.filter(n => n.id !== "core");

    return (
        <div className="h-full flex flex-col p-6 space-y-6 relative overflow-hidden">
             {/* Header */}
             <div className="flex items-center justify-between z-10 relative">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activeNode !== 'idle' ? 'bg-purple-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Neural Node Monitor</h3>
                </div>
                <span className="text-[9px] font-mono text-neutral-700 uppercase">Sector: 0xUTZY</span>
            </div>

            {/* Neural Graph */}
            <div className="flex-1 relative min-h-[180px]">
                 <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <radialGradient id="nodeGlow" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </radialGradient>
                    </defs>

                    {/* Connections */}
                    {satellites.map(node => (
                        <g key={`conn-${node.id}`}>
                            {/* Base Line */}
                            <line
                                x1={core.x} y1={core.y}
                                x2={node.x} y2={node.y}
                                stroke={node.load > 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)"}
                                strokeWidth="1"
                            />

                            {/* Data Packet (from Core to Node) */}
                            {node.load > 0 && (
                                <circle r="2" fill="white">
                                    <animateMotion
                                        dur={`${2000 / node.load}s`}
                                        repeatCount="indefinite"
                                        path={`M${core.x},${core.y} L${node.x},${node.y}`}
                                    />
                                </circle>
                            )}

                             {/* Feedback Packet (from Node to Core) */}
                             {node.load > 50 && (
                                <circle r="1.5" fill={node.id === 'music' ? '#c084fc' : '#22d3ee'}>
                                    <animateMotion
                                        dur={`${3000 / node.load}s`}
                                        repeatCount="indefinite"
                                        path={`M${node.x},${node.y} L${core.x},${core.y}`}
                                    />
                                </circle>
                            )}
                        </g>
                    ))}

                    {/* Nodes */}
                    {nodes.map(node => (
                        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                            {/* Pulse Ring */}
                            {node.load > 0 && (
                                <circle r="20" fill="url(#nodeGlow)" opacity={node.load / 100}>
                                    <animate attributeName="r" from="10" to="30" dur="1.5s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                            )}

                            {/* Node Body */}
                            <circle r="12" fill="#000" stroke={node.load > 0 ? "white" : "#333"} strokeWidth="1.5" />

                            {/* Icon Wrapper (ForeignObject is tricky in SVG, let's use circle color/text instead or overlay div?
                               Actually, we can use React to overlay icons *on top* of SVG.
                               But let's keep it simple: styled circle)
                            */}
                             <circle r="4" fill={node.load > 0 ? (node.id === 'music' ? '#c084fc' : '#22d3ee') : '#333'} />
                        </g>
                    ))}
                 </svg>

                 {/* Overlay Icons (Absolute Positioned based on % for simplicity, or matching SVG coords) */}
                 {nodes.map(node => (
                     <div
                        key={`overlay-${node.id}`}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none"
                        style={{ left: `${(node.x / 400) * 100}%`, top: `${(node.y / 300) * 100}%` }}
                     >
                        <div className={`
                            p-2 rounded-full border bg-black
                            ${node.load > 0 ? 'border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-white/5 text-neutral-700'}
                            transition-all duration-500
                        `}>
                            <node.icon className="w-3 h-3" />
                        </div>
                        <span className={`text-[8px] font-mono tracking-widest uppercase bg-black/50 px-1 rounded ${node.load > 0 ? node.color : 'text-neutral-700'}`}>
                            {node.name}
                        </span>
                     </div>
                 ))}
            </div>

            {/* Footer Stats */}
            <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10">
                 <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-between h-full">
                    <span className="text-[8px] font-mono text-neutral-600 uppercase">VRAM Usage</span>
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-1">
                        {vram}
                    </span>
                </div>
                 <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-between h-full">
                    <span className="text-[8px] font-mono text-neutral-600 uppercase">Synapse Weights</span>
                    <div className="flex flex-col gap-0.5 mt-1">
                        {synapseTop3.slice(0, 2).map((s, i) => (
                             <span key={i} className="text-[8px] font-mono text-neutral-400 uppercase truncate">{s}</span>
                        ))}
                         {synapseTop3.length === 0 && <span className="text-[8px] text-neutral-700">CALIBRATING...</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
