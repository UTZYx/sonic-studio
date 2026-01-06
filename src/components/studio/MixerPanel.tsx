"use client";

import { useEffect, useRef, useState } from "react";
import { AudioEngine } from "@/lib/audio/engine";
import dynamic from "next/dynamic";
import { Knob } from "@/components/ui/Knob";
import { Fader } from "@/components/ui/Fader";
import { Switch } from "@/components/ui/Switch";
import { Mic, Music, Save, Volume2, Sliders, Play, Square, Activity, Layers } from "lucide-react";
import { motion } from "framer-motion";

const Visualizer = dynamic(() => import("./Visualizer").then(mod => mod.Visualizer), { ssr: false });

interface MixerProps {
    voiceUrl: string | null;
    musicUrl: string | null;
    voiceJobId?: string | null;
    musicJobId?: string | null;
    onSave?: (jobId: string, type: string) => void;
}

export function MixerPanel({ voiceUrl, musicUrl, voiceJobId, musicJobId, onSave }: MixerProps) {
    const engineRef = useRef<AudioEngine | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);

    const [voiceVol, setVoiceVol] = useState(0.8);
    const [musicVol, setMusicVol] = useState(0.5);
    const [voicePan, setVoicePan] = useState(0);
    const [musicPan, setMusicPan] = useState(0);
    const [voiceMuted, setVoiceMuted] = useState(false);
    const [musicMuted, setMusicMuted] = useState(false);
    const [solo, setSolo] = useState<"voice" | "music" | null>(null);

    const [voiceBuffer, setVoiceBuffer] = useState<AudioBuffer | null>(null);
    const [musicBuffer, setMusicBuffer] = useState<AudioBuffer | null>(null);

    useEffect(() => {
        engineRef.current = new AudioEngine();
        return () => engineRef.current?.stop();
    }, []);

    useEffect(() => {
        const load = async () => {
            if (!engineRef.current) return;
            setLoading(true);
            try {
                if (voiceUrl) {
                    const res = await engineRef.current.loadTrack(voiceUrl, "voice");
                    if (res) setVoiceBuffer(res.buffer);
                }
                if (musicUrl) {
                    const res = await engineRef.current.loadTrack(musicUrl, "music");
                    if (res) setMusicBuffer(res.buffer);
                }
            } catch (e) {
                console.error("Load failed", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [voiceUrl, musicUrl]);

    useEffect(() => {
        const engine = engineRef.current;
        if (!engine) return;

        let evVol = voiceMuted || (solo === "music") ? 0 : voiceVol;
        let emVol = musicMuted || (solo === "voice") ? 0 : musicVol;

        engine.setVolume("voice", evVol);
        engine.setVolume("music", emVol);
        engine.setPan("voice", voicePan);
        engine.setPan("music", musicPan);
    }, [voiceVol, musicVol, voicePan, musicPan, voiceMuted, musicMuted, solo]);

    const togglePlay = () => {
        if (!engineRef.current) return;
        engineRef.current.resume();
        if (isPlaying) {
            engineRef.current.stop();
            setIsPlaying(false);
        } else {
            engineRef.current.playMixed(voiceBuffer, musicBuffer);
            setIsPlaying(true);
        }
    };

    const handleBounce = async () => {
        if (!voiceBuffer && !musicBuffer) return;

        console.log("Bouncing mix...");
        setLoading(true);

        try {
            // Determine total length
            const d1 = voiceBuffer?.duration || 0;
            const d2 = musicBuffer?.duration || 0;
            const length = Math.max(d1, d2);
            const sampleRate = 44100;

            const offlineCtx = new OfflineAudioContext(2, length * sampleRate, sampleRate);

            // Reconstruct graph offline
            if (voiceBuffer) {
                const src = offlineCtx.createBufferSource();
                src.buffer = voiceBuffer;
                const gain = offlineCtx.createGain();
                const panner = offlineCtx.createStereoPanner();

                let vVol = voiceMuted || (solo === "music") ? 0 : voiceVol;
                gain.gain.value = vVol;
                panner.pan.value = voicePan;

                src.connect(gain).connect(panner).connect(offlineCtx.destination);
                src.start(0);
            }

            if (musicBuffer) {
                const src = offlineCtx.createBufferSource();
                src.buffer = musicBuffer;
                const gain = offlineCtx.createGain();
                const panner = offlineCtx.createStereoPanner();

                let mVol = musicMuted || (solo === "voice") ? 0 : musicVol;
                gain.gain.value = mVol;
                panner.pan.value = musicPan;

                src.connect(gain).connect(panner).connect(offlineCtx.destination);
                src.start(0);
            }

            const renderedBuffer = await offlineCtx.startRendering();

            // Convert to WAV Blob
            const { audioBufferToWav } = await import("@/lib/audio/utils");
            const blob = audioBufferToWav(renderedBuffer);
            const url = URL.createObjectURL(blob);

            // Trigger Download
            const a = document.createElement("a");
            a.href = url;
            a.download = `UTZYx_Mix_${new Date().toISOString().slice(0, 19)}.wav`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error("Bounce failed", e);
        } finally {
            setLoading(false);
        }
    };

    // Helper used from utils

    const ChannelStrip = ({ label, icon: Icon, color, vol, setVol, pan, setPan, muted, setMuted, isSolo, setSolo, jobId, url }: any) => (
        <div className={`p-6 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden transition-all duration-500 ${isSolo ? 'ring-1 ring-yellow-500/20' : ''}`}>
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-black/40 text-${color === 'cyan' ? 'cyan-400' : 'purple-400'}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</div>
                        <div className={`text-[8px] font-mono tracking-widest ${url ? "text-cyan-500" : "text-neutral-700 uppercase"}`}>
                            {url ? "SIGNAL ACTIVE" : "NO LINK"}
                        </div>
                    </div>
                </div>
                {jobId && onSave && (
                    <button
                        onClick={() => onSave(jobId, label.includes("Voice") ? "Voice" : "Music")}
                        className="p-2 rounded-lg hover:bg-white/10 text-neutral-600 hover:text-white transition-all"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex flex-col items-center gap-6 relative z-10">
                <Knob label="PAN" value={pan} onChange={setPan} min={-1} max={1} color="white" size={36} />
                <Fader label="LVL" value={vol} onChange={setVol} min={0} max={1.2} color={color} height={140} />
                <div className="flex gap-2 w-full">
                    <button
                        onClick={() => setMuted(!muted)}
                        className={`flex-1 py-1.5 rounded-lg text-[8px] font-black transition-all border ${muted ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-black/40 border-white/5 text-neutral-600'}`}
                    >
                        MUTE
                    </button>
                    <button
                        onClick={() => setSolo(isSolo ? null : (label.includes("Voice") ? "voice" : "music"))}
                        className={`flex-1 py-1.5 rounded-lg text-[8px] font-black transition-all border ${isSolo ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-black/40 border-white/5 text-neutral-600'}`}
                    >
                        SOLO
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
                <div className="flex-1 w-full relative">
                    <div className="h-[120px] rounded-2xl overflow-hidden bg-black/40 border border-white/5 relative group">
                        <Visualizer analyser={engineRef.current?.analyser || null} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        <div className="absolute top-4 left-4 flex items-center gap-3">
                            <div className="p-2 bg-black/60 rounded-xl border border-white/10 backdrop-blur-md">
                                <Activity className={`w-3.5 h-3.5 ${isPlaying ? "text-cyan-400" : "text-neutral-800"}`} />
                            </div>
                            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest bg-black/40 px-2 py-1 rounded">Master Bus</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="flex gap-4">
                        <button
                            onClick={togglePlay}
                            disabled={loading || (!voiceBuffer && !musicBuffer)}
                            className={`
                                relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700
                                ${isPlaying ? "bg-red-500/10 border border-red-500/30 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : "bg-white text-black shadow-xl hover:scale-105"}
                                disabled:opacity-20
                            `}
                        >
                            {isPlaying ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-1" />}
                            {isPlaying && <div className="absolute inset-0 rounded-full border border-red-500/50 animate-ping opacity-20" />}
                        </button>

                        <button
                            onClick={handleBounce}
                            disabled={loading || (!voiceBuffer && !musicBuffer)}
                            className="w-16 h-16 rounded-full flex items-center justify-center border border-whit/10 bg-black/40 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-400 transition-all disabled:opacity-20 group"
                            title="Bounce Mix to Wav"
                        >
                            <Layers className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    <span className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">
                        {loading ? "SYNCING..." : isPlaying ? "STOP SESSION" : "IGNITE / BOUNCE"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ChannelStrip label="Voice Spectrum" icon={Mic} color="cyan" vol={voiceVol} setVol={setVoiceVol} pan={voicePan} setPan={setVoicePan} muted={voiceMuted} setMuted={setVoiceMuted} isSolo={solo === "voice"} setSolo={setSolo} jobId={voiceJobId} url={voiceUrl} />
                <ChannelStrip label="Music Spectrum" icon={Music} color="purple" vol={musicVol} setVol={setMusicVol} pan={musicPan} setPan={setMusicPan} muted={musicMuted} setMuted={setMusicMuted} isSolo={solo === "music"} setSolo={setSolo} jobId={musicJobId} url={musicUrl} />
            </div>
        </div>
    );
}
