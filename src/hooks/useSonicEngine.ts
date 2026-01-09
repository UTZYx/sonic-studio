
import { useState, useCallback } from "react";
import { TimelineSegment } from "@/components/studio/Timeline/types";

/**
 * useSonicEngine (v1.0)
 * ---------------------------------------------------------------------------
 * The operational logic for the Sonic Studio.
 * Decouples the "How" (API/State) from the "What" (UI).
 */

export function useSonicEngine(
    timelineSegments: TimelineSegment[],
    setTimelineSegments: (segments: TimelineSegment[] | ((prev: TimelineSegment[]) => TimelineSegment[])) => void,
    addLog: (msg: string) => void
) {
    const [isWorking, setIsWorking] = useState(false);

    const igniteSegment = useCallback(async (segmentId: string) => {
        const segment = timelineSegments.find(s => s.id === segmentId);
        if (!segment || !segment.prompt) return;

        setIsWorking(true);

        // 1. Neural Prompt Engineering (The Wand)
        let finalPrompt = segment.prompt;

        // Inject Constraints
        if (segment.mood && segment.mood !== "Neutral") finalPrompt = `${segment.mood} mood, ${finalPrompt}`;
        if (segment.density) finalPrompt = `${segment.density} density, ${finalPrompt}`;

        // Enhancers
        if (segment.enhancePrompt) {
            const enhancers = ["high fidelity", "studio mastering", "clean mix"];
            finalPrompt = `${finalPrompt}, ${enhancers.join(", ")}`;
        }

        // 2. Resolve Field Layers (Phased Crayons)
        let layerConfigs: Array<{ prompt: string; volume: number; pan: number }> | undefined = undefined;
        if (segment.layers && segment.layers.length > 0) {
            const activeLayers = segment.layers.filter(l => l.active);
            if (activeLayers.length > 0) {
                layerConfigs = activeLayers.map(l => {
                    let p = l.prompt;
                    if (segment.mood && segment.mood !== "Neutral") p = `${segment.mood} mood, ${p}`;
                    if (segment.enhancePrompt) {
                        const enhancers = ["high fidelity", "clean mix"];
                        p = `${p}, ${enhancers.join(", ")}`;
                    }
                    return {
                        prompt: p,
                        volume: l.volume ?? 1.0,
                        pan: l.pan ?? 0.0
                    };
                });
            }
        }

        // 3. Resolve Audio Context (Neural Link)
        let audioContextUrl = undefined;
        if (segment.usePreviousContext) {
            const index = timelineSegments.findIndex(s => s.id === segmentId);
            if (index > 0) {
                const prevSegment = timelineSegments[index - 1];
                if (prevSegment.status === "completed" && prevSegment.audioUrl) {
                    audioContextUrl = prevSegment.audioUrl;
                }
            }
        }

        // Update State -> Generating
        setTimelineSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: "generating" } : s));
        addLog(`[Engine] Igniting Block ${segmentId.slice(0, 4)}...`);

        try {
            // FIRE THE BRIDGE
            const res = await fetch("/api/audio/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: finalPrompt,
                    layers: layerConfigs,
                    type: "music",
                    duration: segment.duration,
                    provider: segment.provider,
                    settings: {
                        instrumentalOnly: true,
                        loop: segment.loop,
                        audioContext: audioContextUrl
                    }
                }),
            });

            const data = await res.json();

            if (data.ok && data.jobId) {
                addLog(`[Link] Job Assigned: ${data.jobId}`);

                // ⚡ Bolt: Adaptive Polling (Smart Channeling)
                // Replaces naive setInterval to reduce network noise and prevent congestion.
                let attempt = 0;
                let isActive = true;

                const poll = async () => {
                    if (!isActive) return;

                    try {
                        const jobRes = await fetch(`/api/audio/jobs/${data.jobId}`);
                        const job = await jobRes.json();

                        if (!isActive) return; // Check again after await

                        if (job.status === "completed" && job.result?.url) {
                            addLog(`[Link] Sync Complete: ${data.jobId}`);
                            setTimelineSegments(prev => prev.map(s => s.id === segmentId ? {
                                ...s,
                                status: "completed",
                                audioUrl: job.result.url,
                                versions: [...s.versions, {
                                    id: job.jobId,
                                    url: job.result.url,
                                    timestamp: Date.now()
                                }],
                                selectedVersionId: job.jobId
                            } : s));
                            setIsWorking(false);
                            return; // Stop polling
                        } else if (job.status === "failed" || job.status === "failed_quota") {
                            addLog(`[Link] Sync Failed: ${job.error || "Unknown"}`);
                            setTimelineSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: "error" } : s));
                            if (job.status === "failed_quota") alert("Neural Credits Depleted. Please Recharge or Switch to Local GPU.");
                            setIsWorking(false);
                            return; // Stop polling
                        }

                        // Adaptive Delay: 1s for first 5 attempts, then 2s, then 4s (max)
                        attempt++;
                        const delay = attempt < 5 ? 1000 : attempt < 15 ? 2000 : 4000;
                        setTimeout(poll, delay);

                    } catch (e) {
                        console.error("Polling Error", e);
                        setIsWorking(false);
                    }
                };

                // Ignite Polling
                setTimeout(poll, 1000);

            } else {
                addLog(`[Engine] Ignition Failed: ${data.error}`);
                setTimelineSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: "error" } : s));
                setIsWorking(false);
            }

        } catch (e: any) {
            console.error("Transmission Error", e);
            addLog(`[Engine] Transmission Error: ${e.message}`);
            setTimelineSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: "error" } : s));
            setIsWorking(false);
        }

    }, [timelineSegments, setTimelineSegments, addLog]);

    return { igniteSegment, isWorking };
}
