"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MixerPanel } from "@/components/studio/MixerPanel";
import { ControlPanel } from "@/components/studio/ControlPanel";
import { LibraryPanel } from "@/components/studio/LibraryPanel";
import { HelpPanel } from "@/components/studio/HelpPanel";
import { Logo } from "@/components/studio/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, SquareActivity, Terminal } from "lucide-react";
import { DEFAULT_PRESET, VOICE_PRESETS } from "@/config/presets";
import { SpatialCard } from "@/components/studio/SpatialCard";
import { v4 as uuidv4 } from "uuid";
import { Project } from "@/lib/projects/types";
import { ModeSelector } from "@/components/studio/ModeSelector";
import { Timeline } from "@/components/studio/Timeline/Timeline";
import { NeuralNodeMonitor } from "@/components/studio/NeuralNodeMonitor";
import { LogContext } from "@/lib/logs/context";
import { TimelineSegment } from "@/components/studio/Timeline/types";
import { SequenceEngine } from "@/lib/audio/SequenceEngine";
import { useSonicEngine } from "@/hooks/useSonicEngine";

export default function StudioPage() {
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [prompt, setPrompt] = useState("Nova x UTZYx — Calibrated. Generate a crisp line.");
    const [mode, setMode] = useState<"voice" | "music" | "sfx">("voice");
    const [status, setStatus] = useState<string>("idle");
    const [provider, setProvider] = useState<"local-gpu" | "cloud-eleven" | "cloud-hf" | undefined>(undefined);

    // Timeline State (Phase 10)
    const [timelineSegments, setTimelineSegments] = useState<TimelineSegment[]>([]);
    const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(-1);
    const sequencerRef = useRef<SequenceEngine | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    // Stable logging function
    const addLog = useCallback((msg: string) => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    }, []);

    const startSave = async () => {
        const name = window.prompt("Project Name:", currentProject?.name || "Cyberpunk Alpha");
        if (!name) return;

        const project: Project = {
            id: currentProject?.id || uuidv4(),
            name,
            created: currentProject?.created || Date.now(),
            modified: Date.now(),
            author: "UTZYx",
            version: 1,
            timeline: timelineSegments,
            globalSettings: {
                tempo: 120, // To be implemented
                prompt: prompt,
                mode: mode
            }
        };

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(project)
            });
            if (res.ok) {
                setCurrentProject(project);
                addLog(`[System] Project Saved: ${name}`);
            }
        } catch (e) {
            addLog("[System] Save Failed");
        }
    };

    const startLoad = async () => {
        const res = await fetch("/api/projects");
        const projects = await res.json();

        if (projects.length === 0) {
            alert("No saved projects found.");
            return;
        }

        const projectList = projects.map((p: any) => `- ${p.name} (${new Date(p.modified).toLocaleTimeString()})`).join("\n");
        const selection = window.prompt(`Load Project (Type Name):\n${projectList}`);

        if (selection) {
            const target = projects.find((p: any) => p.name === selection || p.id === selection);
            if (target) {
                const loadRes = await fetch(`/api/projects?id=${target.id}`);
                const fullProject = await loadRes.json();

                if (fullProject && fullProject.timeline) {
                    setTimelineSegments(fullProject.timeline);
                    setCurrentProject(fullProject);
                    setPrompt(fullProject.globalSettings?.prompt || prompt);
                    setMode(fullProject.globalSettings?.mode || mode);
                    addLog(`[System] Project Loaded: ${target.name}`);
                }
            } else {
                alert("Project not found.");
            }
        }
    };

    // Init Sequencer
    useEffect(() => {
        sequencerRef.current = new SequenceEngine();
        return () => sequencerRef.current?.stop();
    }, []);

    // ⚡️ THE ENGINE (Brain)
    // Decoupled logic hook for neural generation
    const { igniteSegment, isWorking: isEngineWorking } = useSonicEngine(timelineSegments, setTimelineSegments, addLog);

    const playChain = async () => {
        const urls = timelineSegments.filter(s => s.status === "completed" && s.audioUrl).map(s => s.audioUrl!);
        if (urls.length === 0 || !sequencerRef.current) return;

        console.log("Igniting Gapless Sequence...");
        await sequencerRef.current.playSequence(urls, (index) => {
            setActiveSegmentIndex(index);
        }, 2.0); // 2 second crossfade
    };

    const [selectedVoice, setSelectedVoice] = useState<string>(DEFAULT_PRESET.id);
    const [warmth, setWarmth] = useState(0.5);
    const [speed, setSpeed] = useState(0.5);
    const [duration, setDuration] = useState(10);
    const [instrumentalOnly, setInstrumentalOnly] = useState(false);
    const [pollingJobId, setPollingJobId] = useState<string | null>(null);
    const [voiceJobId, setVoiceJobId] = useState<string | null>(null);
    const [musicJobId, setMusicJobId] = useState<string | null>(null);
    const [voiceTrackUrl, setVoiceTrackUrl] = useState<string | null>(null);
    const [musicTrackUrl, setMusicTrackUrl] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem("utzyx_prompt");
        if (saved) setPrompt(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem("utzyx_prompt", prompt);
    }, [prompt]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                const btn = document.getElementById("ignite-trigger");
                if (btn) btn.click();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);


    const startJob = async () => {
        setPollingJobId(null);

        // [Neural Link] - If Music Mode, we route via the Timeline Engine
        if (mode === "music") {
            if (timelineSegments.length === 0) {
                // Ignite the first block
                const firstId = "block-alpha";
                setTimelineSegments([{
                    id: firstId,
                    type: "Intro",
                    provider: "local-gpu",
                    prompt: prompt,
                    duration: duration,
                    status: "idle",
                    versions: [],
                    density: "medium",
                    mood: "Neutral",
                    enhancePrompt: true,
                    loop: false,
                    postFx: "none",
                    usePreviousContext: false,
                    color: "cyan",
                    layers: [] // Initial Field Composition
                }]);
                // Allow state to settle, then Trigger
                setTimeout(() => igniteSegment(firstId), 100);
                return;
            } else {
                // Ignite the *last* or *active* block if it's idle
                const target = timelineSegments[timelineSegments.length - 1];
                if (target.status === "idle" || target.status === "error") {
                    igniteSegment(target.id);
                    return;
                }
            }
        }

        // Default (Legacy) Flow for Voice/SFX
        setStatus("submitting");
        addLog(`Submitting ${mode.toUpperCase()} Job...`);

        try {
            const res = await fetch("/api/audio/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: prompt,
                    type: mode === "voice" ? "tts" : mode === "sfx" ? "sfx" : "music",
                    voiceId: mode === "voice" ? VOICE_PRESETS.find(v => v.id === selectedVoice)?.elevenLabsId : undefined,
                    duration: (mode === "music" || mode === "sfx") ? duration : undefined,
                    settings: { warmth, speed, instrumentalOnly }
                }),
            });
            const data = await res.json();

            if (data.ok && data.jobId) {
                setPollingJobId(data.jobId);
                setStatus("queued");
                addLog(`Job Created: ${data.jobId}`);
            } else {
                setStatus("error");
                addLog(`Error: ${data.error}`);
            }
        } catch (e: any) {
            addLog(`Network Error: ${e.message}`);
        }
    };

    const handleSaveTrack = async (targetJobId: string, type: string) => {
        const title = window.prompt(`Name this ${type} track:`, prompt.slice(0, 20));
        if (title) {
            try {
                const res = await fetch("/api/audio/masters", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jobId: targetJobId, title })
                });
                if (res.ok) {
                    addLog(`Saved ${type} track to Library!`);
                    setLibraryRefreshKey(prev => prev + 1);
                }
            } catch (e) {
                addLog("Error saving track");
            }
        }
    };

    useEffect(() => {
        if (!pollingJobId || status === "completed" || status === "failed") return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/audio/jobs/${pollingJobId}`);
                const job = await res.json();

                if (job.status !== status) {
                    setStatus(job.status);
                    addLog(`Status changed to: ${job.status}`);

                    if (job.metadata?.provider !== provider) {
                        setProvider(job.metadata.provider);
                    }
                }

                if (job.status === "completed" && job.result?.url) {
                    if (job.type === "tts" || job.type === "voice") {
                        setVoiceJobId(pollingJobId);
                        setVoiceTrackUrl(job.result.url);
                        addLog("Voice Track Ready -> Mixer Ch 1");
                    } else if (job.type === "music") {
                        setMusicJobId(pollingJobId);
                        setMusicTrackUrl(job.result.url);
                        addLog("Music Track Ready -> Mixer Ch 2");
                    }
                    setPollingJobId(null);
                }

                if (job.status === "failed") {
                    addLog(`Job Failed: ${job.error}`);
                    setPollingJobId(null);
                }

            } catch (e) {
                // ignore
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [pollingJobId, status, addLog, provider]);

    return (
        <LogContext.Provider value={{ addLog }}>
            <div className="min-h-screen relative bg-[#010101] text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden p-4 md:p-8">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-cyan-500/5 blur-[160px] rounded-full" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-500/5 blur-[160px] rounded-full" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-7xl mx-auto space-y-12 relative z-10"
                >
                    <header className="flex items-center justify-between">
                        <Logo />

                        <div className="flex items-center gap-8">
                            <div className="hidden lg:block">
                                <div className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.3em] mb-1">Sector 01 // Input</div>
                                <div className="flex items-center gap-4">
                                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
                                        Synchronized
                                    </div>
                                    {/* Project Controls */}
                                    <div className="flex items-center gap-2">
                                        <button onClick={startSave} className="text-[9px] font-mono text-neutral-500 hover:text-white transition-colors bg-white/5 px-2 py-0.5 rounded border border-white/5 hover:border-white/20">
                                            SAVE
                                        </button>
                                        <button onClick={startLoad} className="text-[9px] font-mono text-neutral-500 hover:text-white transition-colors bg-white/5 px-2 py-0.5 rounded border border-white/5 hover:border-white/20">
                                            LOAD
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-mono text-neutral-500 border border-white/5 py-1 px-4 rounded-full uppercase tracking-tighter hover:bg-white/5 transition-colors cursor-help">
                                    UTZYx.space
                                </span>
                                <button
                                    onClick={() => setShowHelp(!showHelp)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:border-cyan-500/50 transition-all group"
                                >
                                    <HelpCircle className={`w-5 h-5 transition-colors ${showHelp ? 'text-cyan-400' : 'text-neutral-500 group-hover:text-neutral-200'}`} />
                                </button>
                            </div>
                        </div>
                    </header>

                    <AnimatePresence>
                        {showHelp && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <SpatialCard ledColor="cyan" tilt={false}>
                                    <HelpPanel />
                                </SpatialCard>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-12">
                        {/* 1. Mode Selector (New Navigation) */}
                        <ModeSelector mode={mode} setMode={setMode} />

                        {/* 2. Main Workspace */}
                        <SpatialCard ledColor="cyan">
                            <ControlPanel
                                prompt={prompt}
                                setPrompt={setPrompt}
                                mode={mode}
                                setMode={setMode}
                                selectedVoice={selectedVoice}
                                setVoice={setSelectedVoice}
                                status={status}
                                startJob={startJob}
                                warmth={warmth} setWarmth={setWarmth}
                                speed={speed} setSpeed={setSpeed}
                                duration={duration} setDuration={setDuration}
                                instrumentalOnly={instrumentalOnly} setInstrumentalOnly={setInstrumentalOnly}
                            />
                        </SpatialCard>

                        {/* 3. The Edit Bar (Sonic Timeline) - Rich & Functional */}
                        <AnimatePresence>
                            {mode === "music" && (
                                <motion.div
                                    key="timeline"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex items-center gap-2 mb-4 px-2 mt-8">
                                        <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Sonic Edit Bar // Multi-System</span>
                                    </div>
                                    <SpatialCard ledColor="pink">
                                        <div className="p-8">
                                            <Timeline
                                                segments={timelineSegments}
                                                setSegments={setTimelineSegments}
                                                onGenerateSegment={igniteSegment}
                                                onPlayChain={playChain}
                                                activeIndex={activeSegmentIndex}
                                            />
                                        </div>
                                    </SpatialCard>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3. Mixer (Always visible as the 'Console' output) */}
                        <SpatialCard ledColor="purple">
                            <MixerPanel
                                voiceUrl={voiceTrackUrl}
                                musicUrl={musicTrackUrl}
                                voiceJobId={voiceJobId}
                                musicJobId={musicJobId}
                                onSave={handleSaveTrack}
                            />
                        </SpatialCard>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-12 items-start">
                        <div className="lg:col-span-1 space-y-8">
                            <div>
                                <div className="text-[10px] font-mono text-neutral-700 uppercase tracking-[0.4em] px-4 mb-4">Stream Output</div>
                                <SpatialCard ledColor="cyan" tilt={false} className="h-[280px]">
                                    <div className="p-6 font-mono text-[10px] text-neutral-500 h-full overflow-y-auto noscroll">
                                        {logs.map((log, i) => (
                                            <div key={i} className="flex gap-4 py-1 border-b border-white/5 last:border-0">
                                                <span className="text-neutral-800 shrink-0">{i}</span>
                                                <span className="leading-relaxed">{log}</span>
                                            </div>
                                        ))}
                                    </div>
                                </SpatialCard>
                            </div>

                            <SpatialCard ledColor="pink" tilt={true}>
                                <NeuralNodeMonitor
                                    pulse={status === "processing" || status === "submitting" || status === "queued"}
                                    activeNode={status === "processing" || status === "queued" ? mode : "idle"}
                                    provider={provider}
                                />
                            </SpatialCard>
                        </div>

                        <div className="lg:col-span-3">
                            <LibraryPanel refreshKey={libraryRefreshKey} />
                        </div>
                    </div>

                    <footer className="pt-20 pb-10 flex items-center justify-between border-t border-white/5">
                        <div className="text-[9px] font-mono text-neutral-700 uppercase tracking-[0.5em]">
                            v1.3 // UTZYx Spatial OS
                        </div>
                        <div className="flex gap-8">
                            <span className="text-[9px] font-mono text-neutral-800 uppercase">Latency: 42ms</span>
                            <span className="text-[9px] font-mono text-neutral-800 uppercase">Buffer: 4096 Samples</span>
                        </div>
                    </footer>
                </motion.div>
            </div>
        </LogContext.Provider>
    );
}
