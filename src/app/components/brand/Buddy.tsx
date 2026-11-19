"use client";

import { useId } from "react";
import { tribeTone, tribeToneByKey, type TribeToneKey } from "@/src/app/utils/tribeColor";
import { bubblePath } from "@/src/app/components/brand/bubblePath";
import { cn } from "@/src/lib/utils";

interface BuddyProps {
    /** Picks the logo color (and tail corner) deterministically. */
    name: string;
    /** Force a logo color instead of deriving it from `name` (illustrations). */
    tone?: TribeToneKey;
    /** Rendered size in px (the drawing is vector, so any size stays crisp). */
    size?: number;
    /** Warm light from below, for scenes lit by the campfire. */
    lit?: boolean;
    /** Idle bob + blink. Off for static uses (e.g. small avatars). */
    animated?: boolean;
    /** Seconds; staggers the idle motion within a group. */
    delay?: number;
    className?: string;
}

const INK = "oklch(0.2 0.04 265)";

/**
 * The Tribuzz character: a speech bubble from the logo with a face. One per
 * person in scenes and illustrations, wearing that person's logo color.
 */
export function Buddy({ name, tone: toneKey, size = 36, lit = false, animated = true, delay = 0, className }: BuddyProps) {
    const tone = toneKey ? tribeToneByKey(toneKey) : tribeTone(name);
    // useId can contain ":" or "«»", which break url(#...) references.
    const clipId = `buddy-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const shape = bubblePath(1, 1, 34, 34, tone.corner as "tl" | "tr" | "br" | "bl", 15, 3.5);

    return (
        <svg
            viewBox="0 0 36 36"
            width={size}
            height={size}
            aria-hidden="true"
            className={cn("block shrink-0 overflow-visible", animated && "brand-anim brand-bob", className)}
            style={animated ? { animationDelay: `${delay}s` } : undefined}
        >
            <defs>
                <clipPath id={clipId}>
                    <path d={shape} />
                </clipPath>
            </defs>
            <path d={shape} fill={tone.color} />
            {lit && (
                <ellipse cx="18" cy="38" rx="20" ry="12" fill="oklch(0.88 0.14 70 / 0.45)" clipPath={`url(#${clipId})`} />
            )}
            <g className={animated ? "brand-anim brand-blink" : undefined} style={animated ? { animationDelay: `${delay * 2}s` } : undefined}>
                <rect x="12" y="13" width="3.6" height="5" rx="1.8" fill={INK} />
                <rect x="20.4" y="13" width="3.6" height="5" rx="1.8" fill={INK} />
            </g>
            <path d="M14.5 22.5 Q18 25.5 21.5 22.5" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
