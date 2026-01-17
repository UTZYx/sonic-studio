"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TimelineSegment, SEGMENT_TYPES } from "./types";
import { v4 as uuidv4 } from "uuid";
import TimelineItem from "./TimelineItem";

interface TimelineProps {
    segments: TimelineSegment[];
    setSegments: Dispatch<SetStateAction<TimelineSegment[]>>;
    onGenerateSegment: (segmentId: string) => void;
    onPlayChain: () => void;
    activeIndex?: number; // Visual feedback for playback
}

export function Timeline({ segments, setSegments, onGenerateSegment, onPlayChain, activeIndex = -1 }: TimelineProps) {
    const [selectedType, setSelectedType] = useState(SEGMENT_TYPES[0]);

    // Note: addSegment was defined but unused in the original code.
    // Keeping it here in case it's needed later, but standardizing it.
    const addSegment = useCallback(() => {
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
        setSegments((prev) => [...prev, newSegment]);
    }, [selectedType, setSegments]);

    const duplicateSegment = useCallback((segment: TimelineSegment) => {
        setSegments((prevSegments) => {
            const index = prevSegments.findIndex(s => s.id === segment.id);
            if (index === -1) return prevSegments;

            const newSegment: TimelineSegment = {
                ...segment,
                id: uuidv4(),
                status: "idle",
                audioUrl: undefined,
                versions: [],
                selectedVersionId: undefined,
            };
            const newSegments = [...prevSegments];
            newSegments.splice(index + 1, 0, newSegment);
            return newSegments;
        });
    }, [setSegments]);

    const removeSegment = useCallback((id: string) => {
        setSegments((prevSegments) => prevSegments.filter(s => s.id !== id));
    }, [setSegments]);

    const updateSegment = useCallback((id: string, updates: Partial<TimelineSegment>) => {
        setSegments((prevSegments) =>
            prevSegments.map(s => s.id === id ? { ...s, ...updates } : s)
        );
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
