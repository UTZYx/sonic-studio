"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { TimelineSegment, SEGMENT_TYPES } from "./types";
import { v4 as uuidv4 } from "uuid";
import { TimelineSegmentItem } from "./TimelineSegmentItem";

interface TimelineProps {
    segments: TimelineSegment[];
    setSegments: (segments: TimelineSegment[] | ((prev: TimelineSegment[]) => TimelineSegment[])) => void;
    onGenerateSegment: (segmentId: string) => void;
    onPlayChain: () => void;
    activeIndex?: number; // Visual feedback for playback
}

export function Timeline({ segments, setSegments, onGenerateSegment, onPlayChain, activeIndex = -1 }: TimelineProps) {
    const [selectedType, setSelectedType] = useState(SEGMENT_TYPES[0]);

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
        // Use functional update to be safe, though not strictly required for add
        setSegments(prev => [...prev, newSegment]);
    };

    // Stable callback: depends only on setSegments
    const duplicateSegment = useCallback((segment: TimelineSegment) => {
        setSegments(prevSegments => {
            const index = prevSegments.findIndex(s => s.id === segment.id);
            if (index === -1) return prevSegments;

            const newSegment: TimelineSegment = {
                ...segment, // Clones mood and density too!
                id: uuidv4(),
                status: "idle",
                audioUrl: undefined,
                versions: [],
                selectedVersionId: undefined,
                // Keep prompt and provider!
            };
            const newSegments = [...prevSegments];
            newSegments.splice(index + 1, 0, newSegment);
            return newSegments;
        });
    }, [setSegments]);

    // Stable callback: depends only on setSegments
    const removeSegment = useCallback((id: string) => {
        setSegments(prev => prev.filter(s => s.id !== id));
    }, [setSegments]);

    // Stable callback: depends only on setSegments
    const updateSegment = useCallback((id: string, updates: Partial<TimelineSegment>) => {
        setSegments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }, [setSegments]);

    return (
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
                <div className="w-full flex flex-col items-center justify-center text-neutral-700 space-y-2 border-2 border-dashed border-white/5 rounded-2xl">
                    <span className="text-xs font-mono uppercase">Timeline Empty</span>
                    <span className="text-[9px]">Add a block to begin structure</span>
                </div>
            )}
        </div>
    );
}
