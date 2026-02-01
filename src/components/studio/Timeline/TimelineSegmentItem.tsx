"use client";

import { memo, useCallback, forwardRef } from "react";
import { Trash2, Zap, Copy, Wand2, Repeat } from "lucide-react";
import { motion } from "framer-motion";
import { TimelineSegment, TimelineLayer } from "./types";
import { v4 as uuidv4 } from "uuid";

interface TimelineSegmentItemProps {
    segment: TimelineSegment;
    onUpdate: (id: string, updates: Partial<TimelineSegment>) => void;
    onRemove: (id: string) => void;
    onDuplicate: (segment: TimelineSegment) => void;
    onGenerate: (id: string) => void;
}

const TimelineSegmentItem = memo(forwardRef<HTMLDivElement, TimelineSegmentItemProps>(function TimelineSegmentItem({
    segment,
    onUpdate,
    onRemove,
    onDuplicate,
    onGenerate
}, ref) {

    const handleUpdate = useCallback((updates: Partial<TimelineSegment>) => {
        onUpdate(segment.id, updates);
    }, [segment.id, onUpdate]);

    const handleAddLayer = useCallback(() => {
        if (!segment.layers) return;
        const newLayer: TimelineLayer = {
            id: uuidv4(),
            role: "custom",
            provider: "local-gpu",
            prompt: "",
            active: true,
            volume: 1.0,
            pan: 0
        };
        onUpdate(segment.id, { layers: [...segment.layers, newLayer] });
    }, [segment.id, segment.layers, onUpdate]);

    const handleRemoveLayer = useCallback((layerId: string) => {
        if (!segment.layers) return;
        onUpdate(segment.id, { layers: segment.layers.filter(l => l.id !== layerId) });
    }, [segment.id, segment.layers, onUpdate]);

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-64 flex-none flex flex-col bg-[#111] border-r border-white/5 relative group"
        >
            {/* Header / Title */}
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest text-${segment.color}-400`}>
                    {segment.type}
                </span>
                <span className="text-[9px] font-mono text-neutral-600">
                    {segment.duration}s
                </span>
            </div>

            {/* Constraints Bar: Mood & Density */}
            <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between bg-black/10">
                <input
                    type="text"
                    value={segment.mood}
                    onChange={(e) => handleUpdate({ mood: e.target.value })}
                    className="bg-transparent text-[9px] text-neutral-400 w-20 outline-none border-b border-transparent focus:border-white/20 focus:text-white transition-colors"
                    placeholder="Set Mood"
                />

                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => handleUpdate({ density: "low" })}
                        className={`w-1 h-3 rounded-sm ${segment.density === "low" || segment.density === "medium" || segment.density === "high" ? `bg-${segment.color}-500/50` : "bg-neutral-800"}`}
                    />
                    <button
                        onClick={() => handleUpdate({ density: "medium" })}
                        className={`w-1 h-4 rounded-sm ${segment.density === "medium" || segment.density === "high" ? `bg-${segment.color}-500` : "bg-neutral-800"}`}
                    />
                    <button
                        onClick={() => handleUpdate({ density: "high" })}
                        className={`w-1 h-5 rounded-sm ${segment.density === "high" ? `bg-${segment.color}-400` : "bg-neutral-800"}`}
                    />
                </div>
            </div>

            {segment.layers && segment.layers.length > 0 ? (
                <div className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto relative">
                    {segment.layers.map((layer) => (
                        <div key={layer.id} className="flex items-center gap-2 bg-black/20 p-1.5 rounded border border-white/5 hover:border-white/10 transition-colors group/layer">
                            {/* Active Toggle */}
                            <button
                                onClick={() => {
                                    if (!segment.layers) return;
                                    const newLayers = segment.layers.map(l => l.id === layer.id ? { ...l, active: !l.active } : l);
                                    handleUpdate({ layers: newLayers });
                                }}
                                className={`w-1.5 h-6 rounded-full transition-all ${layer.active ? `bg-${segment.color}-500 shadow-[0_0_5px_currentColor]` : 'bg-neutral-800'}`}
                                title={layer.active ? "Mute Layer" : "Unmute Layer"}
                            />

                            {/* Solo Button */}
                            <button
                                onClick={() => {
                                    if (!segment.layers) return;
                                    const newLayers = segment.layers.map(l => ({
                                        ...l,
                                        active: l.id === layer.id // Only this one active
                                    }));
                                    handleUpdate({ layers: newLayers });
                                }}
                                className="bg-neutral-800 text-[6px] font-mono text-neutral-500 hover:text-white hover:bg-white/10 w-4 h-4 rounded flex items-center justify-center transition-colors"
                                title="Solo Layer"
                            >
                                S
                            </button>

                            {/* Role & Provider */}
                            <div className="flex flex-col w-12">
                                <input
                                    value={layer.role}
                                    onChange={(e) => {
                                        if (!segment.layers) return;
                                        const newLayers = segment.layers.map(l => l.id === layer.id ? { ...l, role: e.target.value as any } : l);
                                        handleUpdate({ layers: newLayers });
                                    }}
                                    className="bg-transparent text-[7px] font-black uppercase tracking-wider text-neutral-500 outline-none w-full"
                                />
                                <span className="text-[6px] font-mono text-neutral-600 truncate">{layer.provider.split('-')[1]}</span>
                            </div>

                            {/* Layer Prompt */}
                            <input
                                value={layer.prompt}
                                onChange={(e) => {
                                    if (!segment.layers) return;
                                    const newLayers = segment.layers.map(l => l.id === layer.id ? { ...l, prompt: e.target.value } : l);
                                    handleUpdate({ layers: newLayers });
                                }}
                                className="flex-1 bg-transparent text-[9px] outline-none text-neutral-300 placeholder:text-neutral-700 font-mono"
                                placeholder={`Describe ${layer.role}...`}
                            />

                            {/* Mixing Controls (Vol / Pan) */}
                            <div className="flex items-center gap-2 pr-2 border-l border-white/5 pl-2 opacity-50 group-hover/layer:opacity-100 transition-opacity">
                                {/* Vol */}
                                <div className="flex flex-col items-center w-8">
                                    <span className="text-[6px] font-mono text-neutral-500 uppercase">VOL</span>
                                    <input
                                        type="range"
                                        min="0" max="1" step="0.1"
                                        value={layer.volume ?? 1.0}
                                        onChange={(e) => {
                                            if (!segment.layers) return;
                                            const newLayers = segment.layers.map(l => l.id === layer.id ? { ...l, volume: parseFloat(e.target.value) } : l);
                                            handleUpdate({ layers: newLayers });
                                        }}
                                        className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
                                        title={`Volume: ${(layer.volume ?? 1.0) * 100}%`}
                                    />
                                </div>
                                {/* Pan */}
                                <div className="flex flex-col items-center w-8">
                                    <span className="text-[6px] font-mono text-neutral-500 uppercase">PAN</span>
                                    <input
                                        type="range"
                                        min="-1" max="1" step="0.1"
                                        value={layer.pan ?? 0}
                                        onChange={(e) => {
                                            if (!segment.layers) return;
                                            const newLayers = segment.layers.map(l => l.id === layer.id ? { ...l, pan: parseFloat(e.target.value) } : l);
                                            handleUpdate({ layers: newLayers });
                                        }}
                                        className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400"
                                        title={`Pan: ${layer.pan ?? 0}`}
                                    />
                                </div>
                            </div>

                            {/* Remove Layer */}
                            <button
                                onClick={() => handleRemoveLayer(layer.id)}
                                className="opacity-0 group-hover/layer:opacity-100 text-neutral-600 hover:text-red-400 transition-opacity"
                            >
                                <Trash2 className="w-2.5 h-2.5" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={handleAddLayer}
                        className="w-full py-1 text-[8px] uppercase tracking-widest text-neutral-600 hover:text-cyan-400 hover:bg-white/5 rounded border border-dashed border-white/5 transition-colors"
                    >
                        + Add Field Layer
                    </button>
                </div>
            ) : (
                <div className="flex-1 p-3 flex flex-col gap-2 relative">
                    <textarea
                        value={segment.prompt}
                        onChange={(e) => handleUpdate({ prompt: e.target.value })}
                        placeholder={`Describe the ${segment.type}...`}
                        className="w-full flex-1 bg-transparent resize-none text-[10px] text-neutral-300 placeholder:text-neutral-700 outline-none font-mono leading-relaxed pr-6"
                    />

                    {/* Pipeline Toolbar within Input Area */}
                    <div className="absolute right-2 top-2 flex flex-col gap-1">
                        <button
                            onClick={() => handleUpdate({ enhancePrompt: !segment.enhancePrompt })}
                            className={`p-1 rounded-md transition-all ${segment.enhancePrompt ? "bg-purple-500/20 text-purple-400 border border-purple-500/50" : "text-neutral-700 hover:text-neutral-500"}`}
                            title="Neural Prompt Engineering"
                        >
                            <Wand2 className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => handleUpdate({ loop: !segment.loop })}
                            className={`p-1 rounded-md transition-all ${segment.loop ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" : "text-neutral-700 hover:text-neutral-500"}`}
                            title="Loop Structure"
                        >
                            <Repeat className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        {/* Version Control */}
                        {segment.versions.length > 0 ? (
                            <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                                {segment.versions.map((v, idx) => (
                                    <button
                                        key={v.id}
                                        onClick={() => handleUpdate({ selectedVersionId: v.id, audioUrl: v.url })}
                                        className={`w-4 h-4 rounded text-[8px] flex items-center justify-center font-mono ${segment.selectedVersionId === v.id ? `bg-${segment.color}-500 text-white` : "bg-white/10 text-neutral-500"}`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        ) : <div />}

                        {/* Post-Processing Toggle */}
                        <select
                            className="bg-transparent text-[8px] font-mono text-neutral-500 outline-none hover:text-neutral-300 text-right cursor-pointer"
                            value={segment.postFx}
                            onChange={(e) => handleUpdate({ postFx: e.target.value as any })}
                        >
                            <option value="none">No FX</option>
                            <option value="reverb">Reverb</option>
                            <option value="lofi">Lo-Fi</option>
                            <option value="mastering">Master</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Actions Footer */}
            <div className="p-2 border-t border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onRemove(segment.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-600 hover:text-red-400 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onDuplicate(segment)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                        title="Clone Block"
                    >
                        <Copy className="w-3 h-3" />
                    </button>
                </div>

                <button
                    onClick={() => onGenerate(segment.id)}
                    disabled={!segment.prompt || segment.status === "generating"}
                    className={`
                            flex items-center gap-1 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all
                            ${segment.status === "completed"
                            ? "bg-white/10 text-white hover:bg-white/20"
                            : segment.status === "generating"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                                : "bg-white text-black hover:scale-105"
                        }
                        `}
                >
                    {segment.status === "generating" ? "Building..." : <><Zap className="w-3 h-3" /> {segment.status === "completed" ? "Regen" : "Ignite"}</>}
                </button>
            </div>

            {/* Visual Progress Bar */}
            {segment.status === "generating" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-neutral-800">
                    <motion.div
                        className={`h-full bg-${segment.color}-500`}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 20, ease: "linear" }}
                    />
                </div>
            )}
        </motion.div>
    );
}));

export default TimelineSegmentItem;
