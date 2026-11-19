"use client";

import { tribeToneByKey, type TribeToneKey } from "@/src/app/utils/tribeColor";
import { bubblePath, type BubbleCorner } from "@/src/app/components/brand/bubblePath";
import { Buddy } from "@/src/app/components/brand/Buddy";
import { usePauseWhenHidden } from "@/src/app/components/brand/usePauseWhenHidden";

/**
 * Hand-built SVG illustrations for the landing's feature sections, drawn
 * only with the brand's own pieces: logo-colored speech bubbles (bubblePath)
 * and Buddy characters. Colors come from CSS variables, so they follow the
 * light/dark theme. Gentle float motion uses the shared `brand-*` classes.
 */

const INK = "oklch(0.2 0.04 265)";
const VIEW = "0 0 480 360";

/* ---------------------------------------------------------------- helpers */

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
    const ref = usePauseWhenHidden<HTMLDivElement>();
    return (
        <div ref={ref} className="h-full w-full">
            <svg viewBox={VIEW} role="img" aria-label={label} className="h-full w-full overflow-visible">
                {children}
            </svg>
        </div>
    );
}

/** A floating group; `delay` staggers it against its neighbors. */
function Float({ children, delay = 0, duration = 5 }: { children: React.ReactNode; delay?: number; duration?: number }) {
    return (
        <g
            className="brand-anim brand-float"
            style={{ transformBox: "fill-box", animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
        >
            {children}
        </g>
    );
}

function Bubble({ x, y, w, h, tone, corner, opacity = 1 }: { x: number; y: number; w: number; h: number; tone: TribeToneKey; corner?: BubbleCorner; opacity?: number }) {
    const t = tribeToneByKey(tone);
    return <path d={bubblePath(x, y, w, h, corner ?? (t.corner as BubbleCorner))} fill={t.color} opacity={opacity} />;
}

/** Placeholder "text" lines inside a message bubble. */
function TextLines({ x, y, widths, color = "oklch(1 0 0 / 0.75)" }: { x: number; y: number; widths: number[]; color?: string }) {
    return (
        <>
            {widths.map((w, i) => (
                <rect key={i} x={x} y={y + i * 11} width={w} height="5" rx="2.5" fill={color} />
            ))}
        </>
    );
}

/** A Buddy positioned inside an SVG (Buddy renders its own nested <svg>). */
function PlacedBuddy({ x, y, size, tone, delay = 0 }: { x: number; y: number; size: number; tone: TribeToneKey; delay?: number }) {
    return (
        <Float delay={delay} duration={3.2}>
            <g transform={`translate(${x} ${y})`}>
                <Buddy name={tone} tone={tone} size={size} animated={false} />
            </g>
        </Float>
    );
}

/* ---------------------------------------------------------------- glyphs */

const Glyph = {
    note: <path d="M-6 8 a5 5 0 1 0 0.01 0 M-1 8 V-10 L10 -13 V4 a5 5 0 1 0 0.01 0 M-1 -4 L10 -7" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
    game: <path d="M-12 -6 h24 a8 8 0 0 1 8 8 v2 a6 6 0 0 1 -11 3 l-2 -3 h-14 l-2 3 a6 6 0 0 1 -11 -3 v-2 a8 8 0 0 1 8 -8 Z M-10 0 v6 M-13 3 h6 M8 1 h0.01 M12 5 h0.01" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
    palette: <path d="M0 -13 a13 13 0 1 0 0 26 c3 0 4 -2 3 -4 c-1 -3 1 -5 4 -5 h3 a6 6 0 0 0 6 -6 c0 -6 -7 -11 -16 -11 Z M-6 -4 h0.01 M0 -7 h0.01 M6 -4 h0.01" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
    book: <path d="M0 -8 C-5 -12 -12 -12 -16 -10 V10 C-12 8 -5 8 0 12 C5 8 12 8 16 10 V-10 C12 -12 5 -12 0 -8 Z M0 -8 V12" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />,
    search: <path d="M-3 -3 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0 M5 5 L13 13" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />,
};

function GlyphBubble({ cx, cy, size, tone, glyph, delay }: { cx: number; cy: number; size: number; tone: TribeToneKey; glyph: keyof typeof Glyph; delay: number }) {
    return (
        <Float delay={delay}>
            <Bubble x={cx - size / 2} y={cy - size / 2} w={size} h={size} tone={tone} />
            <g transform={`translate(${cx} ${cy}) scale(${size / 64})`}>{Glyph[glyph]}</g>
        </Float>
    );
}

/* ------------------------------------------------------------ explore */

/** Explore: a map of tribe bubbles (music, games, art, books) linked by paths around a search bubble. */
export function ExploreIllustration({ label }: { label: string }) {
    const nodes = [
        { cx: 112, cy: 92, size: 74, tone: "violet", glyph: "note", delay: 0 },
        { cx: 372, cy: 84, size: 70, tone: "teal", glyph: "game", delay: 0.8 },
        { cx: 96, cy: 262, size: 68, tone: "sun", glyph: "palette", delay: 1.6 },
        { cx: 384, cy: 262, size: 76, tone: "coral", glyph: "book", delay: 2.4 },
    ] as const;
    return (
        <Frame label={label}>
            <defs>
                <pattern id="explore-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.6" fill="var(--border)" />
                </pattern>
            </defs>
            <rect width="480" height="360" fill="url(#explore-dots)" />
            {nodes.map((n) => (
                <path
                    key={n.glyph}
                    d={`M240 180 Q${(240 + n.cx) / 2} ${n.cy < 180 ? 180 : n.cy} ${n.cx} ${n.cy}`}
                    fill="none"
                    stroke="var(--muted-foreground)"
                    strokeOpacity="0.45"
                    strokeWidth="2.5"
                    strokeDasharray="2 9"
                    strokeLinecap="round"
                />
            ))}
            {nodes.map((n) => <GlyphBubble key={n.glyph} {...n} />)}
            <Float delay={0.4} duration={4}>
                <circle cx="240" cy="180" r="62" fill="var(--primary)" opacity="0.14" />
                <Bubble x={196} y={136} w={88} h={88} tone="coral" corner="bl" />
                <g transform="translate(240 178) scale(1.45)">{Glyph.search}</g>
            </Float>
            <PlacedBuddy x={262} y={214} size={44} tone="sun" delay={1.2} />
        </Frame>
    );
}

/* ---------------------------------------------------------- community */

/** Community: two buddies in a conversation, reactions floating up. */
export function CommunityIllustration({ label }: { label: string }) {
    return (
        <Frame label={label}>
            <ellipse cx="240" cy="318" rx="190" ry="22" fill="var(--muted)" />
            {/* The thread between them */}
            <Float delay={0}>
                <Bubble x={150} y={60} w={150} h={52} tone="violet" corner="bl" />
                <TextLines x={168} y={74} widths={[96, 64]} />
            </Float>
            <Float delay={0.9}>
                <Bubble x={196} y={128} w={136} h={52} tone="teal" corner="br" />
                <TextLines x={214} y={142} widths={[84, 100]} color="oklch(0.2 0.04 265 / 0.45)" />
            </Float>
            <Float delay={1.8}>
                <Bubble x={150} y={196} w={112} h={44} tone="sun" corner="bl" />
                <TextLines x={168} y={210} widths={[70]} color="oklch(0.2 0.04 265 / 0.45)" />
            </Float>
            {/* Reactions drifting up */}
            <Float delay={0.3} duration={3.6}>
                <path d="M356 96 c-6 -8 -18 -4 -18 5 c0 8 10 13 18 20 c8 -7 18 -12 18 -20 c0 -9 -12 -13 -18 -5 Z" fill="var(--tribe-coral)" />
            </Float>
            <Float delay={1.4} duration={4.2}>
                <path d="M110 120 l5 10 l11 2 l-8 8 l2 11 l-10 -5 l-10 5 l2 -11 l-8 -8 l11 -2 Z" fill="var(--tribe-sun)" />
            </Float>
            <PlacedBuddy x={62} y={214} size={92} tone="coral" delay={0.2} />
            <PlacedBuddy x={330} y={210} size={96} tone="violet" delay={0.9} />
            <PlacedBuddy x={250} y={262} size={46} tone="teal" delay={1.6} />
        </Frame>
    );
}

/* -------------------------------------------------------------- safety */

/** Safety: a shield-shaped bubble with a check, watching over the group inside a protective ring. */
export function SafetyIllustration({ label }: { label: string }) {
    const violet = tribeToneByKey("violet").color;
    return (
        <Frame label={label}>
            <circle cx="240" cy="190" r="150" fill="var(--tribe-violet)" opacity="0.08" />
            <circle
                cx="240" cy="190" r="132"
                fill="none" stroke="var(--tribe-violet)" strokeOpacity="0.5" strokeWidth="3" strokeDasharray="4 12" strokeLinecap="round"
                className="brand-anim brand-spin"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
            <Float delay={0} duration={4.5}>
                <path d="M240 64 C276 82 304 86 330 84 V170 C330 222 292 256 240 276 C188 256 150 222 150 170 V84 C176 86 204 82 240 64 Z" fill={violet} />
                <path d="M240 64 C276 82 304 86 330 84 V170 C330 222 292 256 240 276 Z" fill="oklch(1 0 0 / 0.12)" />
                <path d="M202 172 L230 200 L282 142" fill="none" stroke="oklch(1 0 0 / 0.95)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            </Float>
            {/* Sparkles: everything in order */}
            {[[118, 96, 0.6], [362, 118, 1.5], [346, 262, 2.2]].map(([x, y, d]) => (
                <Float key={`${x}-${y}`} delay={d} duration={3}>
                    <path d={`M${x} ${y - 12} Q${x + 2} ${y - 2} ${x + 12} ${y} Q${x + 2} ${y + 2} ${x} ${y + 12} Q${x - 2} ${y + 2} ${x - 12} ${y} Q${x - 2} ${y - 2} ${x} ${y - 12} Z`} fill="var(--tribe-sun)" />
                </Float>
            ))}
            <PlacedBuddy x={120} y={250} size={60} tone="teal" delay={0.4} />
            <PlacedBuddy x={300} y={252} size={58} tone="coral" delay={1.1} />
            <PlacedBuddy x={212} y={284} size={52} tone="sun" delay={1.8} />
        </Frame>
    );
}
