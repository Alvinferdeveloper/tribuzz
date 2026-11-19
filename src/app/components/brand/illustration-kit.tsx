"use client";

import { tribeToneByKey, type TribeToneKey } from "@/src/app/utils/tribeColor";
import { bubblePath, type BubbleCorner } from "@/src/app/components/brand/bubblePath";
import { Buddy } from "@/src/app/components/brand/Buddy";
import { usePauseWhenHidden } from "@/src/app/components/brand/usePauseWhenHidden";

/**
 * Building blocks for the brand's hand-built SVG illustrations (landing
 * features, auth showcase…). Everything is drawn with the brand's own pieces:
 * logo-colored speech bubbles (bubblePath) and Buddy characters. Colors come
 * from CSS variables so they follow the theme; motion uses the shared
 * `brand-*` classes (paused off-screen and under reduced motion).
 */

/** Ink used for faces and glyphs drawn on top of logo colors. */
export const INK = "oklch(0.2 0.04 265)";

/** SVG root: scales to its box, pauses its animations while off-screen. */
export function IllustrationFrame({ children, label, viewBox }: { children: React.ReactNode; label: string; viewBox: string }) {
    const ref = usePauseWhenHidden<HTMLDivElement>();
    return (
        <div ref={ref} className="h-full w-full">
            <svg viewBox={viewBox} role="img" aria-label={label} className="h-full w-full overflow-visible">
                {children}
            </svg>
        </div>
    );
}

/** A floating group; `delay` staggers it against its neighbors. */
export function Float({ children, delay = 0, duration = 5 }: { children: React.ReactNode; delay?: number; duration?: number }) {
    return (
        <g
            className="brand-anim brand-float"
            style={{ transformBox: "fill-box", animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
        >
            {children}
        </g>
    );
}

/** A logo speech bubble; the tail corner defaults to where that color has it in the logo. */
export function Bubble({ x, y, w, h, tone, corner, opacity = 1 }: { x: number; y: number; w: number; h: number; tone: TribeToneKey; corner?: BubbleCorner; opacity?: number }) {
    const t = tribeToneByKey(tone);
    return <path d={bubblePath(x, y, w, h, corner ?? (t.corner as BubbleCorner))} fill={t.color} opacity={opacity} />;
}

/** Placeholder "text" lines inside a message bubble. */
export function TextLines({ x, y, widths, color = "oklch(1 0 0 / 0.75)" }: { x: number; y: number; widths: number[]; color?: string }) {
    return (
        <>
            {widths.map((w, i) => (
                <rect key={i} x={x} y={y + i * 11} width={w} height="5" rx="2.5" fill={color} />
            ))}
        </>
    );
}

/** A Buddy positioned inside an SVG (Buddy renders its own nested <svg>). */
export function PlacedBuddy({ x, y, size, tone, delay = 0, lit = false }: { x: number; y: number; size: number; tone: TribeToneKey; delay?: number; lit?: boolean }) {
    return (
        <Float delay={delay} duration={3.2}>
            <g transform={`translate(${x} ${y})`}>
                <Buddy name={tone} tone={tone} size={size} lit={lit} animated={false} />
            </g>
        </Float>
    );
}
