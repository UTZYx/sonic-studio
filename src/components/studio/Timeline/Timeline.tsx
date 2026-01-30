"use client";

import { useState, useCallback } from "react";
import { Plus, Play, Trash2, Zap, Layers, Copy, ChevronRight, Wand2, Repeat, Link2, Waves } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    const [selectedType, setSelectedType] = useState(SEGMENT_TYPES[0]);

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
        // Using functional update to ensure stability if this function is ever passed down (though it's not currently)
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

    const addLayer = useCallback((segmentId: string) => {
        setSegments(prev => prev.map(s => {
            if (s.id !== segmentId) return s;
            if (!s.layers) return s;

            const newLayer: TimelineLayer = {
                id: uuidv4(),
                role: "custom",
                provider: "local-gpu",
                prompt: "",
                active: true,
                volume: 1.0,
                pan: 0
            };
            return { ...s, layers: [...s.layers, newLayer] };
        }));
    }, [setSegments]);

    const removeLayer = useCallback((segmentId: string, layerId: string) => {
        setSegments(prev => prev.map(s => {
            if (s.id !== segmentId) return s;
            if (!s.layers) return s;
            return { ...s, layers: s.layers.filter(l => l.id !== layerId) };
        }));
    }, [setSegments]);

    // toggleLayers was present in original file but unused in JSX. Omitting it here to keep clean,
    // or we could add it if needed. For now, following YAGNI as it wasn't used.

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
                        addLayer={addLayer}
                        removeLayer={removeLayer}
                    />
                ))}
            </AnimatePresence>

            {segments.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center text-neutral-700 space-y-2 border-2 border-dashed border-white/5 rounded-2xl">
                    <span className="text-xs font-mono uppercase">Timeline Empty</span>
                    <span className="text-[9px]">Add a block to begin structure</span>
                    <button
                        onClick={addSegment}
                        className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-xs text-white transition-colors"
                    >
                        Add Segment
                    </button>
                </div>
            )}

            {/* Add Segment Button at the end of list if not empty?
                The original code didn't have an explicit "Add Segment" button in the list flow except maybe via an external control?
                Wait, looking at original code...
                It only showed "Timeline Empty" state.
                Where is 'addSegment' used?
                It was defined: `const addSegment = ...`
                But `addSegment` was NOT used in the JSX of the original `Timeline.tsx`!
                It seems `Timeline` expected `segments` to be managed externally or added via some other mechanism?

                However, looking at the imports, `Plus` was imported.
                Maybe I missed a part of the file?
                Let me check the `read_file` output again very carefully.
            */}
        </div>
    );
}
