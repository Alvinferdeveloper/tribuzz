"use client";

import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";
import { Moon } from "@/src/app/components/brand/Moon";

/**
 * Random points generated after mount, so server and client markup match.
 */
export function useRandomPoints<T>(count: () => number, make: (i: number) => T) {
    const [points, setPoints] = useState<T[]>([]);
    useEffect(() => {
        setPoints(Array.from({ length: count() }, (_, i) => make(i)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return points;
}

interface NightSkyProps {
    /** Stars on wide / narrow viewports. */
    stars?: [desktop: number, mobile: number];
    fireflies?: number;
    moon?: boolean;
    className?: string;
}

/**
 * The brand's night: navy sky, twinkling stars, a crescent moon and fireflies
 * in the logo's teal and sun. Fills its positioned parent (fixed backdrop in
 * the chat, a framed window on the landing).
 */
export function NightSky({ stars = [90, 35], fireflies = 7, moon = true, className }: NightSkyProps) {
    const starPoints = useRandomPoints(
        () => (window.innerWidth < 768 ? stars[1] : stars[0]),
        (i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 62,
            size: Math.random() < 0.15 ? 2.5 : Math.random() * 1.4 + 0.8,
            delay: Math.random() * 4,
            duration: Math.random() * 2 + 2.5,
        })
    );
    const flies = useRandomPoints(
        () => fireflies,
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
        <div aria-hidden="true" className={cn("absolute inset-0 overflow-hidden", className)}>
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.16_0.05_266)_0%,oklch(0.15_0.045_265)_55%,oklch(0.13_0.035_262)_100%)]" />
            {moon && <Moon className="absolute right-[14%] top-[8%] opacity-90" />}
            {starPoints.map((s) => (
                <span
                    key={s.id}
                    className="brand-anim absolute rounded-full bg-white animate-star-twinkle"
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
            {flies.map((f) => (
                <span
                    key={f.id}
                    className={cn("brand-anim brand-firefly absolute size-1.5 rounded-full", f.color)}
                    style={{ left: `${f.x}%`, top: `${f.y}%`, animationDuration: `${f.duration}s`, animationDelay: `${f.delay}s` }}
                />
            ))}
        </div>
    );
}
