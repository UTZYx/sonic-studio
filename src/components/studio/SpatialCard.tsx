"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { ReactNode } from "react";

interface SpatialCardProps {
    children: ReactNode;
    className?: string;
    ledColor?: "cyan" | "purple" | "pink";
    tilt?: boolean;
}

export function SpatialCard({ children, className = "", ledColor = "cyan", tilt = true }: SpatialCardProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3deg", "-3deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3deg", "3deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!tilt) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: tilt ? rotateX : 0,
                rotateY: tilt ? rotateY : 0,
                transformStyle: "preserve-3d",
            }}
            className={`spatial-glass-advanced rounded-[2.5rem] p-1 transition-shadow duration-500 group ${className}`}
        >
            {/* The Cursive LED Edge */}
            <div className={`led-cursive-path ${ledColor === "purple" ? "led-cursive-purple" : ledColor === "pink" ? "led-cursive-pink" : ""} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

            <div className="relative z-10 w-full h-full bg-[#080808]/40 rounded-[2.4rem] overflow-hidden">
                {children}
            </div>

            {/* Subtle Inner Glow */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        </motion.div>
    );
}
