"use client";

import React, { memo } from "react";
import { Play, Pause, Trash2, Download, Star } from "lucide-react";
import { motion } from "framer-motion";

export interface AudioFile {
    name: string;
    id: string;
    prompt?: string;
    url: string;
    size: number;
    created: number;
    type: string;
}

interface LibraryItemProps {
    file: AudioFile;
    isPlaying: boolean;
    onPlay: (url: string) => void;
    onDelete: (id: string) => void;
    onPromote: (file: AudioFile) => void;
}

export const LibraryItem = memo(({ file, isPlaying, onPlay, onDelete, onPromote }: LibraryItemProps) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group"
        >
            <div className={`relative bg-neutral-900/40 border border-white/5 hover:border-cyan-500/30 rounded-xl p-4 transition-all ${isPlaying ? 'border-cyan-500/50 bg-cyan-900/10' : ''}`}>
                <div className="flex justify-between items-start gap-4">

                    {/* Play Button */}
                    <button
                        onClick={() => onPlay(file.url)}
                        className={`
                            shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all
                            ${isPlaying
                                ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                                : "bg-white/5 text-white hover:bg-white/20 hover:scale-110"
                            }
                        `}
                    >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
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
                        onClick={() => onDelete(file.id)}
                        className="p-2 text-neutral-600 hover:text-red-400 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => onPromote(file)}
                        className="p-2 text-neutral-600 hover:text-yellow-400 transition-colors"
                        title="Promote to Archive"
                    >
                        <Star className="w-4 h-4" />
                    </button>
                </div>

                {/* Visualizer Bar (Fake for now) */}
                {isPlaying && (
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
    );
});

LibraryItem.displayName = "LibraryItem";
