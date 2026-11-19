"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { tribeTone } from "@/src/app/utils/tribeColor";
import { cn } from "@/src/lib/utils";

interface SceneMember {
    id: string;
    username: string;
}

interface ChatSceneProps {
    theme: "night" | "day";
    members: SceneMember[];
    /** Tribe name: picks the tribe's logo color for its accents (e.g. the picnic blanket). */
    accentName?: string;
}

/**
 * Living backdrop for a chat room. The sky fills the screen behind the
 * messages; the illustration lives on a panoramic horizon at the bottom, so
 * it never sits behind the text you're reading.
 *
 * - Night: a campfire made of the logo's colors, sparks, stars, fireflies.
 * - Day: a tree in the park with a picnic blanket, clouds, birds, leaves.
 *
 * Around the centerpiece sit little speech-bubble characters, one per person
 * connected (in their own logo color), so the room visibly fills up and new
 * arrivals pop in. All motion is CSS transforms/opacity, paused while the tab
 * is hidden and switched off for reduced motion.
 */
function ChatSceneComponent({ theme, members, accentName }: ChatSceneProps) {
    const rootRef = useRef<HTMLDivElement>(null);

    // Don't burn battery animating a background nobody is looking at.
    useEffect(() => {
        const update = () => {
            if (!rootRef.current) return;
            rootRef.current.dataset.paused = document.hidden ? "true" : "false";
        };
        update();
        document.addEventListener("visibilitychange", update);
        return () => document.removeEventListener("visibilitychange", update);
    }, []);

    return (
        <div ref={rootRef} aria-hidden="true" className="chat-scene pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <style>{SCENE_CSS}</style>
            {theme === "night" ? <NightSky /> : <DaySky />}
            <Horizon theme={theme} members={members} accentName={accentName} />
        </div>
    );
}

export default memo(ChatSceneComponent);

/* ------------------------------------------------------------------ sky */

function useRandomPoints<T>(count: () => number, make: (i: number) => T) {
    // Generated after mount so server and client markup match.
    const [points, setPoints] = useState<T[]>([]);
    useEffect(() => {
        setPoints(Array.from({ length: count() }, (_, i) => make(i)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return points;
}

function NightSky() {
    const stars = useRandomPoints(
        () => (window.innerWidth < 768 ? 35 : 90),
        (i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 62,
            size: Math.random() < 0.15 ? 2.5 : Math.random() * 1.4 + 0.8,
            delay: Math.random() * 4,
            duration: Math.random() * 2 + 2.5,
        })
    );
    const fireflies = useRandomPoints(
        () => 7,
        (i) => ({
            id: i,
            x: 8 + Math.random() * 84,
            y: 55 + Math.random() * 25,
            delay: Math.random() * -8,
            duration: 7 + Math.random() * 6,
            color: i % 2 ? "bg-tribe-sun text-tribe-sun" : "bg-tribe-teal text-tribe-teal",
        })
    );

    return (
        <>
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.16_0.05_266)_0%,oklch(0.15_0.045_265)_55%,oklch(0.13_0.035_262)_100%)]" />
            {/* A soft moon high up, to give the sky a focal point. */}
            <div className="absolute right-[14%] top-[8%] size-14 rounded-full bg-[oklch(0.95_0.03_95)] opacity-80 shadow-[0_0_60px_10px_oklch(0.9_0.05_95/0.18)]" />
            <div className="absolute right-[calc(14%-6px)] top-[calc(8%-4px)] size-14 rounded-full bg-[oklch(0.16_0.05_266)]" style={{ transform: "translate(18px, -6px)" }} />
            {stars.map((s) => (
                <span
                    key={s.id}
                    className="scene-anim absolute rounded-full bg-white animate-star-twinkle"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size,
                        height: s.size,
                        ["--duration" as string]: `${s.duration}s`,
                        ["--delay" as string]: `${s.delay}s`,
                    }}
                />
            ))}
            {fireflies.map((f) => (
                <span
                    key={f.id}
                    className={cn("scene-anim absolute size-1.5 rounded-full scene-firefly", f.color)}
                    style={{ left: `${f.x}%`, top: `${f.y}%`, animationDuration: `${f.duration}s`, animationDelay: `${f.delay}s` }}
                />
            ))}
        </>
    );
}

function DaySky() {
    const clouds = useRandomPoints(
        () => 5,
        (i) => ({
            id: i,
            y: 5 + Math.random() * 28,
            scale: 0.6 + Math.random() * 1.1,
            duration: 80 + Math.random() * 60,
            delay: Math.random() * -120,
        })
    );

    return (
        <>
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.87_0.045_240)_0%,oklch(0.915_0.03_225)_45%,oklch(0.95_0.025_200)_100%)]" />
            <div className="absolute right-[18%] top-[7%] size-52 rounded-full bg-[oklch(0.96_0.07_90)] opacity-55 blur-3xl" />
            <div className="absolute right-[22%] top-[11%] size-12 rounded-full bg-[oklch(0.95_0.09_90)] opacity-90" />
            {clouds.map((c) => (
                <div
                    key={c.id}
                    className="scene-anim absolute text-[oklch(0.99_0.004_255)] opacity-75 animate-cloud-drift"
                    style={{ top: `${c.y}%`, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
                >
                    <svg width={100 * c.scale} height={56 * c.scale} viewBox="0 0 100 56">
                        <path fill="currentColor" d="M18 52c-9 0-16-7-16-15s7-15 16-15c2-11 12-20 24-20 10 0 18 6 22 14 2-1 5-1 7-1 11 0 20 8 21 19 5 2 8 7 8 12 0 3-3 6-6 6z" />
                    </svg>
                </div>
            ))}
            {/* Two birds crossing now and then. */}
            {[0, 1].map((i) => (
                <svg
                    key={i}
                    className="scene-anim scene-bird absolute"
                    style={{ top: `${14 + i * 7}%`, animationDelay: `${i * -11}s` }}
                    width="22" height="10" viewBox="0 0 22 10"
                >
                    <path d="M1 7 Q6 1 11 6 Q16 1 21 7" fill="none" stroke="oklch(0.35 0.04 264 / 0.55)" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            ))}
            {/* Cool veil: ties the scene to the app's light neutral and kills glare. */}
            <div className="absolute inset-0 bg-[oklch(0.965_0.01_255/0.35)]" />
        </>
    );
}

/* -------------------------------------------------------------- horizon */

const MAX_VISIBLE = 8;
// Small vertical offsets so the group doesn't look like a lined-up row.
const ROW_OFFSETS = [0, -7, 3, -3];

function Horizon({ theme, members, accentName }: ChatSceneProps) {
    const night = theme === "night";
    const accent = tribeTone(accentName);

    const { left, right, extra } = useMemo(() => {
        const visible = members.slice(0, MAX_VISIBLE);
        return {
            left: visible.filter((_, i) => i % 2 === 0),
            right: visible.filter((_, i) => i % 2 === 1),
            extra: Math.max(0, members.length - MAX_VISIBLE),
        };
    }, [members]);

    return (
        <div className="absolute inset-x-0 bottom-0 h-[clamp(170px,30vh,250px)]">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 38 Q14 22 30 32 Q46 18 62 30 Q80 16 100 30 L100 100 L0 100 Z" fill={night ? "oklch(0.19 0.045 265)" : "oklch(0.86 0.05 150)"} />
                <path d="M0 55 Q20 42 42 52 Q64 40 84 50 Q94 45 100 50 L100 100 L0 100 Z" fill={night ? "oklch(0.155 0.04 265)" : "oklch(0.8 0.07 152)"} />
                <path d="M0 70 Q25 64 50 68 Q75 63 100 69 L100 100 L0 100 Z" fill={night ? "oklch(0.125 0.035 265)" : "oklch(0.74 0.08 155)"} />
            </svg>

            {/* The gathering, sitting just above the composer. */}
            <div className="absolute inset-x-0 bottom-[92px] flex items-end justify-center">
                <Group members={left} side="left" night={night} />
                <div className="relative mx-3 shrink-0 sm:mx-5">
                    {night ? <Campfire /> : <PicnicTree />}
                </div>
                <Group members={right} side="right" night={night} extra={extra} />
            </div>

            {!night && (
                // The picnic blanket in the tribe's own color.
                <div
                    className={cn("absolute bottom-[80px] left-1/2 h-5 w-[min(560px,88vw)] -translate-x-1/2 rounded-[50%] opacity-70", accent.fill)}
                    style={{ backgroundImage: "repeating-linear-gradient(90deg, oklch(1 0 0 / 0.35) 0 10px, transparent 10px 20px)" }}
                />
            )}
        </div>
    );
}

function Group({ members, side, night, extra = 0 }: { members: SceneMember[]; side: "left" | "right"; night: boolean; extra?: number }) {
    // Closest to the fire first on each side.
    const ordered = side === "left" ? [...members].reverse() : members;
    return (
        <div className={cn("flex w-[min(42vw,260px)] items-end gap-2 sm:gap-3", side === "left" ? "justify-end" : "justify-start")}>
            {ordered.map((m, i) => {
                const fromFire = side === "left" ? ordered.length - 1 - i : i;
                return (
                    <Buddy
                        key={m.id}
                        name={m.username}
                        night={night}
                        offset={ROW_OFFSETS[fromFire % ROW_OFFSETS.length]}
                        // Phones show the two closest to the fire per side.
                        className={fromFire >= 2 ? "hidden sm:block" : undefined}
                        delay={fromFire * 0.35 + (side === "right" ? 0.2 : 0)}
                    />
                );
            })}
            {extra > 0 && (
                <span className="mb-1 hidden h-6 items-center rounded-full bg-[oklch(0.2_0.04_265/0.55)] px-2 text-[11px] font-bold text-white sm:inline-flex">
                    +{extra}
                </span>
            )}
        </div>
    );
}

function Buddy({ name, night, offset, delay, className }: { name: string; night: boolean; offset: number; delay: number; className?: string }) {
    const tone = tribeTone(name);
    return (
        <span className={cn("scene-enter block", className)} style={{ transform: `translateY(${offset}px)` }}>
            <span
                className={cn(
                    "scene-anim scene-bob relative flex size-8 items-center justify-center rounded-[45%] sm:size-9",
                    tone.fill, tone.tail,
                    // Firelight from the center at night.
                    night && "shadow-[inset_0_-8px_12px_oklch(0.85_0.15_60/0.35)]"
                )}
                style={{ animationDelay: `${delay}s` }}
            >
                <span className="flex items-center gap-[5px] -translate-y-px">
                    <span className="scene-anim scene-blink block h-[5px] w-[4px] rounded-full bg-[oklch(0.2_0.04_265)]" style={{ animationDelay: `${delay * 2}s` }} />
                    <span className="scene-anim scene-blink block h-[5px] w-[4px] rounded-full bg-[oklch(0.2_0.04_265)]" style={{ animationDelay: `${delay * 2}s` }} />
                </span>
                <span className="absolute bottom-[26%] left-1/2 h-[3px] w-[8px] -translate-x-1/2 rounded-b-full border-b-2 border-[oklch(0.2_0.04_265)]" />
            </span>
        </span>
    );
}

function Campfire() {
    const sparks = [
        { sx: "-10px", d: 2.4, delay: 0 },
        { sx: "8px", d: 2.9, delay: 0.7 },
        { sx: "-4px", d: 2.2, delay: 1.3 },
        { sx: "12px", d: 3.1, delay: 1.9 },
        { sx: "2px", d: 2.6, delay: 2.4 },
    ];
    return (
        <div className="relative flex h-20 w-20 items-end justify-center">
            <span className="scene-anim scene-glow absolute -bottom-10 left-1/2 size-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.8_0.15_60/0.35),transparent_65%)]" />
            {sparks.map((s, i) => (
                <span
                    key={i}
                    className="scene-anim scene-spark absolute bottom-8 left-1/2 size-[3px] rounded-full bg-tribe-sun"
                    style={{ ["--sx" as string]: s.sx, animationDuration: `${s.d}s`, animationDelay: `${s.delay}s` }}
                />
            ))}
            {/* Flames: three layered drops in the logo's coral and sun. */}
            <span className="scene-anim scene-flicker absolute bottom-2 h-14 w-11 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-tribe-coral" />
            <span className="scene-anim scene-flicker absolute bottom-2 h-10 w-8 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-tribe-sun [animation-duration:1.1s]" />
            <span className="scene-anim scene-flicker absolute bottom-2 h-6 w-4 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[oklch(0.97_0.07_95)] [animation-duration:0.8s]" />
            {/* Logs */}
            <span className="absolute bottom-0 h-3 w-16 rotate-[14deg] rounded-full bg-[oklch(0.4_0.05_50)]" />
            <span className="absolute bottom-0 h-3 w-16 -rotate-[14deg] rounded-full bg-[oklch(0.35_0.05_50)]" />
        </div>
    );
}

function PicnicTree() {
    return (
        <div className="relative flex h-28 w-24 items-end justify-center">
            <span className="absolute bottom-0 h-16 w-3.5 rounded-full bg-[oklch(0.5_0.06_55)]" />
            <span className="scene-anim absolute bottom-10 left-1/2 h-20 w-24 -translate-x-1/2 animate-tree-sway" style={{ transformOrigin: "50% 100%" }}>
                <span className="absolute bottom-0 left-1 size-14 rounded-full bg-[oklch(0.68_0.1_155)]" />
                <span className="absolute bottom-0 right-1 size-14 rounded-full bg-[oklch(0.66_0.1_158)]" />
                <span className="absolute bottom-6 left-1/2 size-16 -translate-x-1/2 rounded-full bg-[oklch(0.74_0.11_150)]" />
                {/* Fruit in the logo's colors */}
                <span className="absolute bottom-10 left-5 size-2 rounded-full bg-tribe-coral" />
                <span className="absolute bottom-5 right-6 size-2 rounded-full bg-tribe-sun" />
                <span className="absolute bottom-14 right-8 size-2 rounded-full bg-tribe-violet" />
            </span>
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="scene-anim scene-leaf absolute bottom-16 size-2 rounded-[50%_0] bg-[oklch(0.7_0.11_150)]"
                    style={{ left: `${30 + i * 18}%`, animationDelay: `${i * 1.6}s` }}
                />
            ))}
        </div>
    );
}

/* Scene-only keyframes, kept with the component so the scene is self-contained. */
const SCENE_CSS = `
.chat-scene[data-paused="true"] .scene-anim,
.chat-scene[data-paused="true"] .scene-anim * { animation-play-state: paused !important; }
@keyframes scene-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.scene-bob { animation: scene-bob 2.6s ease-in-out infinite; }
@keyframes scene-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
.scene-blink { animation: scene-blink 4.2s ease-in-out infinite; transform-origin: center; }
@keyframes scene-enter { from { transform: translateY(16px) scale(0.6); opacity: 0; } to { opacity: 1; } }
.scene-enter { animation: scene-enter 420ms cubic-bezier(0.23, 1, 0.32, 1) both; }
@keyframes scene-flicker {
  0%, 100% { transform: scaleY(1) skewX(0deg); }
  25% { transform: scaleY(1.1) skewX(-3deg); }
  50% { transform: scaleY(0.94) skewX(2deg); }
  75% { transform: scaleY(1.06) skewX(-1deg); }
}
.scene-flicker { animation: scene-flicker 1.4s ease-in-out infinite; transform-origin: 50% 100%; }
/* Only scale here: the -translate-x-1/2 utility uses the separate CSS translate property. */
@keyframes scene-glow { 0%, 100% { opacity: 0.75; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
.scene-glow { animation: scene-glow 2.2s ease-in-out infinite; }
@keyframes scene-spark {
  0% { transform: translate(0, 0); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: translate(var(--sx), -80px); opacity: 0; }
}
.scene-spark { animation: scene-spark 2.6s ease-out infinite; }
@keyframes scene-firefly {
  0%, 100% { transform: translate(0, 0); opacity: 0.2; }
  25% { transform: translate(24px, -18px); opacity: 1; }
  50% { transform: translate(-10px, -34px); opacity: 0.4; }
  75% { transform: translate(-28px, -12px); opacity: 0.9; }
}
.scene-firefly { animation: scene-firefly 9s ease-in-out infinite; box-shadow: 0 0 8px 2px currentColor; }
@keyframes scene-bird { from { transform: translateX(-10vw); } to { transform: translateX(110vw); } }
.scene-bird { left: 0; animation: scene-bird 26s linear infinite; }
@keyframes scene-leaf {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  15% { opacity: 0.9; }
  100% { transform: translate(18px, 70px) rotate(220deg); opacity: 0; }
}
.scene-leaf { animation: scene-leaf 5s ease-in infinite; }
@media (prefers-reduced-motion: reduce) {
  .chat-scene .scene-anim, .chat-scene .scene-anim *, .chat-scene .scene-enter { animation: none !important; }
}
`;
