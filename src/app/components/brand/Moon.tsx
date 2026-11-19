"use client";

import { useId } from "react";
import { cn } from "@/src/lib/utils";

/**
 * Crescent moon with a soft glow. The crescent is cut with an SVG mask, so it
 * is truly transparent and works over any backdrop (a plain night sky, the
 * landing's animated space background, light or dark theme).
 */
export function Moon({ size = 56, className }: { size?: number; className?: string }) {
    const maskId = `moon-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 56 56"
            width={size}
            height={size}
            className={cn("overflow-visible drop-shadow-[0_0_28px_oklch(0.92_0.06_95/0.45)]", className)}
        >
            <defs>
                <mask id={maskId}>
                    <rect width="56" height="56" fill="white" />
                    <circle cx="40" cy="22" r="23" fill="black" />
                </mask>
            </defs>
            <circle cx="28" cy="28" r="26" fill="oklch(0.94 0.05 92)" mask={`url(#${maskId})`} />
        </svg>
    );
}
