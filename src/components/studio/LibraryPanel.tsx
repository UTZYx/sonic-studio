"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Trash2, Download, Music, Box, Star, Disc } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SpatialCard } from "./SpatialCard";
import { useLog } from "@/lib/logs/context";

interface AudioFile {
    name: string;
    id: string;
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

    const fetchLibrary = async () => {
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
                    path: "",
                    url: t.url,
                    size: t.size,
                    created: t.created,
                    type: t.type
                }));
                // Sort by newest first
                mapped.sort((a: any, b: any) => b.created - a.created);
                setFiles(mapped);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLibrary();
    }, [refreshKey]);

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

            <div className="flex items-center justify-between px-2 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Box className="w-5 h-5 text-purple-400 relative z-10" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase">Sonic Archive</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.2em]">Storage: ~/SonicStudio/outputs</p>
                        </div>
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
                <div className="border border-white/5 border-dashed rounded-[3rem] p-24 text-center group hover:border-white/10 hover:bg-white/[0.02] transition-all cursor-default">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                        <Music className="w-16 h-16 text-neutral-800 group-hover:text-neutral-500 transition-colors relative z-10" />
                    </div>
                    <p className="text-neutral-500 text-xs font-mono uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">
                        Archive Empty. Ignite a job.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {files.map((file, idx) => (
                            <motion.div
                                key={file.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                className="group"
                            >
                                <div className={`
                                    relative bg-neutral-900/40 border rounded-2xl p-4 transition-all overflow-hidden
                                    ${playingFile === file.url
                                        ? 'border-cyan-500/50 bg-cyan-900/10 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
                                        : 'border-white/5 hover:border-white/20 hover:bg-white/5'}
                                `}>
                                    {/* Playback Progress / EQ Background */}
                                    {playingFile === file.url && (
                                         <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex items-end justify-between px-8 pb-4 gap-1">
                                             {[...Array(20)].map((_, i) => (
                                                 <motion.div
                                                    key={i}
                                                    className="flex-1 bg-cyan-400 rounded-t-sm"
                                                    animate={{
                                                        height: ["10%", "80%", "30%"]
                                                    }}
                                                    transition={{
                                                        duration: 0.5 + Math.random() * 0.5,
                                                        repeat: Infinity,
                                                        repeatType: "reverse",
                                                        ease: "easeInOut"
                                                    }}
                                                 />
                                             ))}
                                         </div>
                                    )}

                                    <div className="flex justify-between items-center gap-4 relative z-10">

                                        {/* Play Button */}
                                        <button
                                            onClick={() => handlePlay(file.url)}
                                            aria-label={playingFile === file.url ? "Pause Track" : "Play Track"}
                                            className={`
                                                shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                                                ${playingFile === file.url
                                                    ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] rotate-0"
                                                    : "bg-white/5 text-white hover:bg-white/20 hover:scale-105 group-hover:rotate-12"
                                                }
                                            `}
                                        >
                                            {playingFile === file.url ? (
                                                <Pause className="w-5 h-5 fill-current" />
                                            ) : (
                                                <Play className="w-5 h-5 fill-current ml-0.5" />
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`text-[11px] font-bold truncate font-mono tracking-wider transition-colors ${playingFile === file.url ? "text-cyan-400" : "text-neutral-300 group-hover:text-white"}`} title={file.name}>
                                                    {file.name}
                                                </h3>
                                                {playingFile === file.url && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-mono text-neutral-600 uppercase flex items-center gap-1">
                                                    <Disc className="w-3 h-3" />
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </span>
                                                <span className="text-[9px] font-mono text-neutral-600 uppercase border-l border-white/10 pl-3">
                                                    {new Date(file.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <a
                                                href={file.url}
                                                download={file.name}
                                                className="p-2 text-neutral-500 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
                                                title="Download"
                                                aria-label={`Download ${file.name}`}
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>

                                            <button
                                                onClick={() => handleDelete(file.id)}
                                                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete"
                                                aria-label={`Delete ${file.name}`}
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
                                                className="p-2 text-neutral-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                                title="Promote to Archive"
                                                aria-label="Promote to Crimson Cassini"
                                            >
                                                <Star className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
