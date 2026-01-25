"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { TimelineSegment, SEGMENT_TYPES } from "./types";
import { v4 as uuidv4 } from "uuid";
import { TimelineItem } from "./TimelineItem";

interface TimelineProps {
    segments: TimelineSegment[];
    setSegments: (segments: TimelineSegment[] | ((prev: TimelineSegment[]) => TimelineSegment[])) => void;
    onGenerateSegment: (segmentId: string) => void;
    onPlayChain: () => void;
    activeIndex?: number; // Visual feedback for playback
}

export function Timeline({ segments, setSegments, onGenerateSegment, onPlayChain, activeIndex = -1 }: TimelineProps) {
    const [selectedType] = useState(SEGMENT_TYPES[0]);

    const addSegment = useCallback(() => {
        setSegments(prev => {
            const newSegment: TimelineSegment = {
                id: uuidv4(),
                type: selectedType.type,
                duration: selectedType.defaultDuration,
                prompt: "",
                status: "idle",
                color: selectedType.color,
                provider: "cloud-hf",
                versions: [],
                selectedVersionId: undefined,
                enhancePrompt: false,
                loop: false,
                postFx: "none",
                mood: "Neutral",
                density: "medium",
                usePreviousContext: true,
                layers: []
            };
            return [...prev, newSegment];
        });
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
        <div className="flex h-full w-full overflow-x-auto p-4 gap-4">
            <AnimatePresence mode="popLayout">
                {segments.map((segment) => (
                    <TimelineItem
                        key={segment.id}
                        segment={segment}
                        onUpdate={updateSegment}
                        onRemove={removeSegment}
                        onDuplicate={duplicateSegment}
                        onGenerate={onGenerateSegment}
                    />
                ))}
            </AnimatePresence>

            <div className="flex-none w-12 flex items-center justify-center">
                <button
                    onClick={addSegment}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 flex items-center justify-center text-neutral-500 hover:text-white transition-all"
                    title="Add Segment"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {segments.length === 0 && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-neutral-700 space-y-2">
                    <span className="text-xs font-mono uppercase">Timeline Empty</span>
                    <span className="text-[9px]">Add a block to begin structure</span>
                </div>
            )}
        </div>
    );
}
