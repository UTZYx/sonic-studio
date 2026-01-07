"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Trash2, Download, Music, Box, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SpatialCard } from "./SpatialCard";
import { useLog } from "@/lib/logs/context";

interface AudioFile {
    name: string;
    id: string;   // Was missing?
    prompt?: string;
    url: string;
    size: number;
    created: number;
    type: string;
}

export function LibraryPanel({ refreshKey = 0 }: { refreshKey?: number }) {
    const [files, setFiles] = useState<AudioFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingFile, setPlayingFile] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { addLog } = useLog();

    const fetchLibrary = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/audio/masters");
            const data = await res.json();
            if (data.tracks) {
                addLog(`[Library] Indexing ${data.tracks.length} outputs...`);
                // Map API response to UI model
                const mapped = data.tracks.map((t: any) => ({
                    id: t.id,
                    name: t.title,
                    prompt: t.prompt,
                    path: "", // Deprecated
                    url: t.url,
                    size: t.size,
                    created: t.created,
                    type: t.type
                }));
                setFiles(mapped);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [addLog]);

    useEffect(() => {
        fetchLibrary();
    }, [refreshKey, fetchLibrary]);

    const handlePlay = (url: string) => {
        if (playingFile === url) {
            audioRef.current?.pause();
            setPlayingFile(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
                setPlayingFile(url);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this track permanently?")) return;

        try {
            const res = await fetch(`/api/audio/masters/${id}`, { method: "DELETE" });
            if (res.ok) {
                setFiles(prev => prev.filter(f => f.id !== id));
                addLog(`[Archive] Deleted track ${id}`);
            } else {
                alert("Failed to delete track");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting track");
        }
    };

    return (
        <div className="space-y-10">
            <audio
                ref={audioRef}
                onEnded={() => setPlayingFile(null)}
                onError={() => {
                    addLog(`[Error] Playback failed for active track.`);
                    setPlayingFile(null);
                    alert("Audio file unreachable.");
                }}
                className="hidden"
            />

            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                        <Box className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase">Sonic Archive</h2>
                        <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.2em] mt-1">Local Storage: ~/SonicStudio/outputs</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-neutral-500 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 uppercase tracking-widest">
                        {files.length} FRAGMENTS
                    </span>
                </div>
            </div>

            {loading && files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-neutral-800 gap-6">
                    <div className="w-10 h-10 border border-neutral-900 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="font-mono text-[9px] uppercase tracking-[0.4em]">Scanning Neural Outputs...</p>
                </div>
            ) : files.length === 0 ? (
                <div className="border border-white/5 border-dashed rounded-[3rem] p-24 text-center group hover:border-white/10 transition-colors">
                    <Music className="w-12 h-12 text-neutral-900 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                    <p className="text-neutral-700 text-xs font-mono uppercase tracking-[0.2em]">Archive Empty. Ignite a job.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {files.map((file, idx) => (
                            <motion.div
                                key={file.name}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group"
                            >
                                <div className={`relative bg-neutral-900/40 border border-white/5 hover:border-cyan-500/30 rounded-xl p-4 transition-all ${playingFile === file.url ? 'border-cyan-500/50 bg-cyan-900/10' : ''}`}>
                                    <div className="flex justify-between items-start gap-4">

                                        {/* Play Button */}
                                        <button
                                            onClick={() => handlePlay(file.url)}
                                            className={`
                                                shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all
                                                ${playingFile === file.url
                                                    ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                                                    : "bg-white/5 text-white hover:bg-white/20 hover:scale-110"
                                                }
                                            `}
                                        >
                                            {playingFile === file.url ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                        </button>

                                        <div className="flex-1 min-w-0 pt-1">
                                            <h3 className="text-[10px] font-bold text-neutral-300 truncate font-mono tracking-wider mb-1" title={file.name}>
                                                {file.name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-mono text-neutral-600 uppercase">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </span>
                                                <span className="text-[8px] font-mono text-neutral-600 uppercase border-l border-white/10 pl-2">
                                                    {new Date(file.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        <a
                                            href={file.url}
                                            download={file.name}
                                            className="p-2 text-neutral-600 hover:text-cyan-400 transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>

                                        <button
                                            onClick={() => handleDelete(file.id)}
                                            className="p-2 text-neutral-600 hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={async () => {
                                                await fetch("/api/audio/favorites", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        filename: file.name,
                                                        prompt: file.prompt || "unknown"
                                                    })
                                                });
                                                addLog(`[Archive] Promoted '${file.name}' to Crimson Cassini`);
                                                alert("Archived to Crimson Cassini");
                                            }}
                                            className="p-2 text-neutral-600 hover:text-yellow-400 transition-colors"
                                            title="Promote to Archive"
                                        >
                                            <Star className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Visualizer Bar (Fake for now) */}
                                    {playingFile === file.url && (
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500/20 overflow-hidden rounded-b-xl">
                                            <motion.div
                                                className="h-full bg-cyan-400 blur-[2px]"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
