"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, ReactNode } from "react";

interface PulsingButtonProps {
    children: ReactNode;
    trigger?: any; // Value that triggers the pulse
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    id?: string;
}

export function PulsingButton({ children, trigger, className = "", onClick, disabled, id }: PulsingButtonProps) {
    const controls = useAnimation();

    useEffect(() => {
        if (trigger) {
            controls.start({
                scale: [1, 1.05, 1],
                boxShadow: [
                    "0 0 0px rgba(34, 211, 238, 0)",
                    "0 0 20px rgba(34, 211, 238, 0.3)",
                    "0 0 0px rgba(34, 211, 238, 0)"
                ],
                transition: { duration: 0.4 }
            });
        }
    }, [trigger, controls]);

    return (
        <motion.button
            id={id}
            onClick={onClick}
            disabled={disabled}
            className={className}
            animate={controls}
            whileTap={{ scale: 0.98 }}
        >
            {children}
        </motion.button>
    );
}
