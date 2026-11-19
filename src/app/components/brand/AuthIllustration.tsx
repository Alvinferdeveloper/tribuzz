"use client";

import { useId } from "react";
import { bubblePath } from "@/src/app/components/brand/bubblePath";
import { INK, IllustrationFrame, Float, Bubble, TextLines, PlacedBuddy } from "@/src/app/components/brand/illustration-kit";

export type AuthIllustrationVariant = "login" | "signup" | "verified";

interface AuthIllustrationProps {
    variant: AuthIllustrationVariant;
    /** What the arriving Buddy says (already translated). */
    greeting: string;
    /** Accessible description of the scene. */
    label: string;
}

const VIEW = "0 0 520 440";

/** Light bubble for the newcomer's greeting, readable on the night sky. */
const GREETING_FILL = "oklch(0.97 0.01 255)";

/**
 * Auth showcase: a tribe gathered around its campfire, the conversation
 * rising in logo bubbles, and a Buddy walking in from the left to say hi.
 * The story of every sign-in: you're arriving at your tribe. The group
 * answers with a heart when you come back (login) or once you're in
 * (verified), and a spark when you're new (signup). Meant for the dark brand
 * panel, in both themes.
 */
export function AuthIllustration({ variant, greeting, label }: AuthIllustrationProps) {
    const glowId = `auth-glow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

    return (
        <IllustrationFrame viewBox={VIEW} label={label}>
            <defs>
                <radialGradient id={glowId}>
                    <stop offset="0%" stopColor="oklch(0.82 0.15 62)" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="oklch(0.82 0.15 62)" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* The tribe's island and the fire's warm light on it */}
            <ellipse cx="270" cy="396" rx="236" ry="36" fill="oklch(0.22 0.045 265)" />
            <ellipse cx="270" cy="390" rx="204" ry="24" fill="oklch(0.255 0.05 265)" />
            <circle className="brand-anim brand-glow" style={{ transformBox: "fill-box", transformOrigin: "center" }} cx="310" cy="362" r="150" fill={`url(#${glowId})`} />

            {/* Footsteps of the newcomer, arriving from off-scene */}
            <path d="M-20 392 Q30 380 70 388" fill="none" stroke="oklch(1 0 0 / 0.28)" strokeWidth="3" strokeDasharray="1 11" strokeLinecap="round" />

            {/* The conversation going on around the fire */}
            <Float delay={0}>
                <Bubble x={206} y={118} w={156} h={52} tone="violet" corner="bl" />
                <TextLines x={224} y={132} widths={[104, 70]} />
            </Float>
            <Float delay={1}>
                <Bubble x={300} y={186} w={138} h={48} tone="teal" corner="br" />
                <TextLines x={318} y={199} widths={[96, 62]} color="oklch(0.2 0.04 265 / 0.45)" />
            </Float>

            {/* Back row, then the fire, then the front row (depth) */}
            <PlacedBuddy x={292} y={286} size={50} tone="teal" delay={0.6} lit />
            <Campfire x={318} y={376} />
            <PlacedBuddy x={204} y={300} size={80} tone="coral" delay={0.2} lit />
            <PlacedBuddy x={368} y={306} size={72} tone="violet" delay={1.1} lit />

            {/* The newcomer and their greeting */}
            <Float delay={0.4} duration={4}>
                <path d={bubblePath(28, 246, 132, 48, "bl", 20, 5)} fill={GREETING_FILL} />
                <text x="94" y="277" textAnchor="middle" fontSize="19" fontWeight="700" fill={INK} style={{ fontFamily: "inherit" }}>
                    {greeting}
                </text>
            </Float>
            <PlacedBuddy x={50} y={318} size={62} tone="sun" delay={0.9} />

            {/* The tribe's answer */}
            <Float delay={1.5} duration={3.6}>
                {variant !== "signup" ? (
                    <path d="M186 238 c-6 -8 -18 -4 -18 5 c0 8 10 13 18 20 c8 -7 18 -12 18 -20 c0 -9 -12 -13 -18 -5 Z" fill="var(--tribe-coral)" />
                ) : (
                    <path d="M186 222 q3 15 18 18 q-15 3 -18 18 q-3 -15 -18 -18 q15 -3 18 -18 Z" fill="var(--tribe-sun)" />
                )}
            </Float>
        </IllustrationFrame>
    );
}

/** Logs and three flickering flames in the logo's coral and sun; (x, y) is the base center. */
function Campfire({ x, y }: { x: number; y: number }) {
    const flame = "M0 0 C-17 -5 -15 -28 0 -50 C15 -28 17 -5 0 0 Z";
    const flicker = (duration: string) => ({ transformBox: "fill-box" as const, transformOrigin: "50% 100%", animationDuration: duration });
    return (
        <g transform={`translate(${x} ${y})`}>
            <rect x="-30" y="-6" width="60" height="11" rx="5.5" fill="oklch(0.38 0.05 50)" transform="rotate(14)" />
            <rect x="-30" y="-6" width="60" height="11" rx="5.5" fill="oklch(0.33 0.05 50)" transform="rotate(-14)" />
            <g transform="translate(0 -4)">
                <g transform="scale(1.15)"><path className="brand-anim brand-flicker" style={flicker("1.4s")} d={flame} fill="var(--tribe-coral)" /></g>
                <g transform="scale(0.8)"><path className="brand-anim brand-flicker" style={flicker("1.1s")} d={flame} fill="var(--tribe-sun)" /></g>
                <g transform="scale(0.45)"><path className="brand-anim brand-flicker" style={flicker("0.8s")} d={flame} fill="oklch(0.97 0.07 95)" /></g>
            </g>
        </g>
    );
}
