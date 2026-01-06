"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { TimelineSegment, SEGMENT_TYPES, TimelineLayer } from "./types";
import { v4 as uuidv4 } from "uuid";
import TimelineSegmentItem from "./TimelineSegmentItem";

interface TimelineProps {
    segments: TimelineSegment[];
    setSegments: React.Dispatch<React.SetStateAction<TimelineSegment[]>>;
    onGenerateSegment: (segmentId: string) => void;
    onPlayChain: () => void;
    activeIndex?: number; // Visual feedback for playback
}

export function Timeline({ segments, setSegments, onGenerateSegment, onPlayChain, activeIndex = -1 }: TimelineProps) {
    const [selectedType, setSelectedType] = useState<typeof SEGMENT_TYPES[number]>(SEGMENT_TYPES[0]);

    const addSegment = useCallback(() => {
        const newSegment: TimelineSegment = {
            id: uuidv4(),
            type: selectedType.type,
            duration: selectedType.defaultDuration,
            prompt: "",
            status: "idle",
            color: selectedType.color,
            provider: "cloud-hf", // Default to Cloud Free for now
            versions: [],
            selectedVersionId: undefined,
            enhancePrompt: false, // Default off
            loop: false,
            postFx: "none",
            mood: "Neutral",
            density: "medium",
            usePreviousContext: true, // Default to linked chain
            layers: []
        };
        setSegments(prev => [...prev, newSegment]);
    }, [selectedType, setSegments]);

    const duplicateSegment = useCallback((segment: TimelineSegment) => {
        setSegments(prev => {
            const index = prev.findIndex(s => s.id === segment.id);
            if (index === -1) return prev;

            const newSegment: TimelineSegment = {
                ...segment, // Clones mood and density too!
                id: uuidv4(),
                status: "idle",
                audioUrl: undefined,
                versions: [],
                selectedVersionId: undefined,
                // Keep prompt and provider!
            };
            const newSegments = [...prev];
            newSegments.splice(index + 1, 0, newSegment);
            return newSegments;
        });
    }, [setSegments]);

    const removeSegment = useCallback((id: string) => {
        setSegments(prev => prev.filter(s => s.id !== id));
    }, [setSegments]);

    const updateSegment = useCallback((id: string, updates: Partial<TimelineSegment>) => {
        setSegments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }, [setSegments]);

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center gap-4">
                <div className="flex bg-white/5 rounded-lg p-1">
                    {SEGMENT_TYPES.map((type) => (
                        <button
                            key={type.type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${selectedType.type === type.type ? `bg-${type.color}-500 text-white shadow-lg` : "text-neutral-500 hover:text-white"}`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={addSegment}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                >
                    <Plus className="w-3 h-3" /> Add Block
                </button>
            </div>

            {/* Timeline Strip */}
            <div className="flex h-full w-full overflow-x-auto p-4 gap-4">
                <AnimatePresence mode="popLayout">
                    {segments.map((segment) => (
                        <TimelineSegmentItem
                            key={segment.id}
                            segment={segment}
                            updateSegment={updateSegment}
                            removeSegment={removeSegment}
                            duplicateSegment={duplicateSegment}
                            onGenerateSegment={onGenerateSegment}
                        />
                    ))}
                </AnimatePresence>

                {segments.length === 0 && (
                    <div className="w-full flex flex-col items-center justify-center text-neutral-700 space-y-2 border-2 border-dashed border-white/5 rounded-2xl p-8">
                        <span className="text-xs font-mono uppercase">Timeline Empty</span>
                        <span className="text-[9px]">Add a block to begin structure</span>
                    </div>
                )}
            </div>
        </div>
    );
}
