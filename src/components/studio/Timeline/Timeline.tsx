"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { TimelineSegment, SEGMENT_TYPES, TimelineLayer } from "./types";
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
    const [selectedType, setSelectedType] = useState(SEGMENT_TYPES[0]);

    // Although unused in current UI, kept for completeness if UI expands
    const addSegment = () => {
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
    };

    const duplicateSegment = useCallback((segmentId: string) => {
        setSegments(prev => {
            const index = prev.findIndex(s => s.id === segmentId);
            if (index === -1) return prev;

            const segment = prev[index];
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

            {segments.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center text-neutral-700 space-y-2 border-2 border-dashed border-white/5 rounded-2xl">
                    <span className="text-xs font-mono uppercase">Timeline Empty</span>
                    <span className="text-[9px]">Add a block to begin structure</span>
                </div>
            )}
        </div>
    );
}
