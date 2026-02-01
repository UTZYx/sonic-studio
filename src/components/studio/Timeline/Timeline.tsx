"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { TimelineSegment, SEGMENT_TYPES } from "./types";
import { v4 as uuidv4 } from "uuid";
import TimelineSegmentItem from "./TimelineSegmentItem";

interface TimelineProps {
    segments: TimelineSegment[];
    setSegments: (segments: TimelineSegment[] | ((prev: TimelineSegment[]) => TimelineSegment[])) => void; // Updated type for functional update
    onGenerateSegment: (segmentId: string) => void;
    onPlayChain: () => void;
    activeIndex?: number; // Visual feedback for playback
}

// Note: setSegments might be typed as (segments: TimelineSegment[]) => void in parent.
// If so, using functional updates might cause TS error if the parent type is strict.
// But standard React setState accepts functional updates.
// Let's assume setSegments is a standard state setter.

export function Timeline({ segments, setSegments, onGenerateSegment, onPlayChain, activeIndex = -1 }: TimelineProps) {
    const [selectedType, setSelectedType] = useState(SEGMENT_TYPES[0]);

    // We don't use addSegment directly here? It was used in original code?
    // Wait, addSegment was defined but NOT used in the returned JSX in original code!
    // Let me check. The original code had:
    // const addSegment = () => { ... }
    // But where was it called?
    // In original file:
    // {segments.length === 0 && ( ... "Add a block to begin structure" ... )}
    // But there was NO button to call addSegment in the empty state!
    // And NO button elsewhere!
    // Maybe I missed it?
    // "Timeline Empty ... Add a block to begin structure" -> Just text.
    // Wait, looking at original file again...
    // I see `addSegment` defined. But I don't see it used.
    // Maybe it's intended to be used but missing?
    // Or maybe I missed where it was attached.
    // I see "Timeline Empty" div.
    // Ah, there is NO button to add segment in the original code visible in the `read_file` output?
    // Wait, let's look at `read_file` output of `Timeline.tsx` again.

    // Line 39: const addSegment = ...
    // Line 239: {segments.length === 0 && ( ... )}

    // It seems `addSegment` was indeed unused in the UI.
    // OR, it was passed to something? No.
    // Maybe it is a bug in the original code that I am fixing or preserving?
    // I should preserve it if I can, or ignore it if unused.
    // Since I am refactoring, I will leave it out if it is unused to clean up,
    // OR keep it if I suspect I missed something (like it being passed to a child).
    // But I see no child using it.

    // HOWEVER, I should check if `addSegment` is called by `ControlPanel` or something?
    // No, `Timeline` exports `Timeline`.

    // I will keep `addSegment` logic just in case, but unused code is unused.
    // Actually, `addSegment` might be useful if I fix the UI?
    // But my task is performance optimization, not UI fix.
    // So I will comment it out or remove it if unused.

    // Wait, let's look closer at `Timeline.tsx` read output.
    // Maybe it was used in `ControlPanel`? No, this is `Timeline.tsx`.

    // Okay, I will proceed with refactoring `updateSegment`, `removeSegment`, `duplicateSegment`.

    const duplicateSegment = useCallback((segment: TimelineSegment) => {
        // We cast setSegments to any to allow functional updates if the prop type is strict
        // But usually it is Dispatch<SetStateAction<...>> which allows functional updates.
        // If setSegments comes from `useState`, it supports it.
        (setSegments as any)((prev: TimelineSegment[]) => {
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
        (setSegments as any)((prev: TimelineSegment[]) => prev.filter(s => s.id !== id));
    }, [setSegments]);

    const updateSegment = useCallback((id: string, updates: Partial<TimelineSegment>) => {
        (setSegments as any)((prev: TimelineSegment[]) => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }, [setSegments]);

    return (
        <div className="flex h-full w-full overflow-x-auto p-4 gap-4">
            <AnimatePresence mode="popLayout">
                {segments.map((segment) => (
                    <TimelineSegmentItem
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
                    {/* Restoring the missing functionality just in case? No, stick to original behavior */}
                </div>
            )}
        </div>
    );
}
