
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

function Waveform({ analyser }: { analyser: AnalyserNode | null }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const count = 128;
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const dataArray = useMemo(() => new Uint8Array(256), []);
    // Bolt: Reuse single Color instance to avoid GC in useFrame loop
    const tempColor = useMemo(() => new THREE.Color(), []);

    useFrame((state) => {
        if (!mesh.current) return;

        if (analyser) {
            analyser.getByteFrequencyData(dataArray);
        }

        const time = state.clock.getElapsedTime();

        for (let i = 0; i < count; i++) {
            const x = (i / count) * 40 - 20; // Spread wider (-20 to 20)
            const freq = analyser ? dataArray[i * 2] / 255 : 0; // Skip every other bin for wider range
            const scale = 0.5 + (freq * 6);

            dummy.position.set(x, Math.sin(time + i * 0.1) * 0.5, 0);
            dummy.scale.set(0.15, scale, 0.15);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();

            mesh.current.setMatrixAt(i, dummy.matrix);

            // Color update: Strict Cyan (0.5) to Purple (0.8)
            tempColor.setHSL(0.5 + (freq * 0.3), 1, 0.5 + freq * 0.5);
            mesh.current.setColorAt(i, tempColor);
        }
        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]} >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial toneMapped={false} />
        </instancedMesh>
    );
}

export function Visualizer({ analyser }: { analyser: AnalyserNode | null }) {
    return (
        <div className="h-48 w-full rounded-xl overflow-hidden bg-black/50 border border-neutral-800 relative">
            <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
                <color attach="background" args={["#000000"]} />
                <fog attach="fog" args={["#000000", 10, 40]} />
                <ambientLight intensity={0.5} />
                <Waveform analyser={analyser} />
                <EffectComposer>
                    <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={2.0} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
