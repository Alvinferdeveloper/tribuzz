"use client";

import { useId } from "react";
import { bubblePath } from "@/src/app/components/brand/bubblePath";
import { INK, IllustrationFrame, Float, PlacedBuddy } from "@/src/app/components/brand/illustration-kit";

export type StatusIllustrationVariant = "lost" | "fire-out";

interface StatusIllustrationProps {
    variant: StatusIllustrationVariant;
    /** What the lost Buddy calls out (already translated); "lost" only. */
    speech?: string;
    label: string;
}

const VIEW = "0 0 440 360";
const ISLAND = "oklch(0.22 0.045 265)";
const ISLAND_TOP = "oklch(0.255 0.05 265)";

/**
 * Night scenes for the status pages, drawn with the illustration kit:
 * - "lost" (404): a lone Buddy calling out on a small island, footsteps
 *   wandering in circles, and its tribe's fire far away in the distance.
 * - "fire-out" (error): two Buddies by a campfire that just went out.
 */
export function StatusIllustration({ variant, speech, label }: StatusIllustrationProps) {
    return (
        <IllustrationFrame viewBox={VIEW} label={label}>
            {variant === "lost" ? <Lost speech={speech ?? ""} /> : <FireOut />}
        </IllustrationFrame>
    );
}

function Lost({ speech }: { speech: string }) {
    const glowId = `status-glow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    return (
        <>
            <defs>
                <radialGradient id={glowId}>
                    <stop offset="0%" stopColor="oklch(0.82 0.15 62)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="oklch(0.82 0.15 62)" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* The tribe, far away: a small island with its fire glowing */}
            <circle className="brand-anim brand-glow" style={{ transformBox: "fill-box", transformOrigin: "center" }} cx="372" cy="150" r="46" fill={`url(#${glowId})`} />
            <ellipse cx="372" cy="170" rx="56" ry="9" fill={ISLAND} opacity="0.8" />
            <path d="M372 166 C364 164 365 154 372 146 C379 154 380 164 372 166 Z" fill="var(--tribe-coral)" className="brand-anim brand-flicker" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }} />
            <g opacity="0.75">
                <PlacedBuddy x={340} y={146} size={20} tone="violet" delay={0.3} />
                <PlacedBuddy x={384} y={148} size={18} tone="teal" delay={0.9} />
            </g>

            {/* Footsteps going around in circles */}
            <path d="M96 318 C40 300 52 262 110 262 C170 262 196 286 160 304" fill="none" stroke="oklch(1 0 0 / 0.28)" strokeWidth="3" strokeDasharray="1 11" strokeLinecap="round" />

            {/* Our lost Buddy on its own island */}
            <ellipse cx="190" cy="322" rx="130" ry="24" fill={ISLAND} />
            <ellipse cx="190" cy="317" rx="108" ry="15" fill={ISLAND_TOP} />
            <Float delay={0.3} duration={4}>
                <path d={bubblePath(150, 150, 128, 48, "bl", 20, 5)} fill="oklch(0.97 0.01 255)" />
                <text x="214" y="181" textAnchor="middle" fontSize="20" fontWeight="700" fill={INK} style={{ fontFamily: "inherit" }}>
                    {speech}
                </text>
            </Float>
            <PlacedBuddy x={146} y={218} size={96} tone="sun" delay={0.6} />
        </>
    );
}

function FireOut() {
    // Smoke rising from the cold logs, each wisp drifting on its own beat.
    const wisps = [
        { d: "M0 0 C-10 -14 10 -24 0 -40 C-8 -52 6 -60 0 -72", x: 222, delay: 0 },
        { d: "M0 0 C8 -12 -8 -22 2 -36 C10 -46 -4 -54 2 -64", x: 236, delay: 1.1 },
        { d: "M0 0 C-6 -10 8 -18 -2 -30", x: 210, delay: 2 },
    ];
    return (
        <>
            <ellipse cx="220" cy="322" rx="190" ry="26" fill={ISLAND} />
            <ellipse cx="220" cy="317" rx="160" ry="16" fill={ISLAND_TOP} />

            {wisps.map((w) => (
                <Float key={w.x} delay={w.delay} duration={3.4}>
                    <path d={w.d} transform={`translate(${w.x} 282)`} fill="none" stroke="oklch(0.75 0.02 260 / 0.55)" strokeWidth="5" strokeLinecap="round" />
                </Float>
            ))}

            {/* Cold logs, a last ember */}
            <g transform="translate(222 304)">
                <rect x="-34" y="-6" width="68" height="12" rx="6" fill="oklch(0.36 0.04 50)" transform="rotate(12)" />
                <rect x="-34" y="-6" width="68" height="12" rx="6" fill="oklch(0.31 0.04 50)" transform="rotate(-12)" />
                <circle cx="6" cy="-6" r="3.5" fill="var(--tribe-coral)" className="brand-anim brand-glow" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
            </g>

            <PlacedBuddy x={82} y={226} size={84} tone="teal" delay={0.2} />
            <PlacedBuddy x={282} y={232} size={78} tone="violet" delay={1} />
        </>
    );
}
