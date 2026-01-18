"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Music, Box } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useLog } from "@/lib/logs/context";
import { LibraryItem, AudioFile } from "./LibraryItem";

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
    };

    useEffect(() => {
        fetchLibrary();
    }, [refreshKey]);

    const handlePlay = useCallback((url: string) => {
        setPlayingFile(current => {
            if (current === url) {
                audioRef.current?.pause();
                return null;
            } else {
                if (audioRef.current) {
                    audioRef.current.src = url;
                    audioRef.current.play();
                }
                return url;
            }
        });
    }, []);

    const handleDelete = useCallback(async (id: string) => {
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
    }, [addLog]);

    const handlePromote = useCallback(async (file: AudioFile) => {
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
    }, [addLog]);

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
                        {files.map((file) => (
                            <LibraryItem
                                key={file.id || file.name}
                                file={file}
                                isPlaying={playingFile === file.url}
                                onPlay={handlePlay}
                                onDelete={handleDelete}
                                onPromote={handlePromote}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
