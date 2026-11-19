"use client";

import { useId } from "react";
import { bubblePath } from "@/src/app/components/brand/bubblePath";
import { cn } from "@/src/lib/utils";

/**
 * Tribuzz icon set: line icons drawn on the logo's speech-bubble geometry
 * (soft corners, one nearly square "tail" corner), so icons speak the same
 * shape language as the Buddies and the bubble UI. 24px grid, 2px stroke,
 * currentColor. Plain utility glyphs (check, plus, arrows) stay on lucide;
 * these are for the places where an icon carries meaning or brand.
 */

type IconProps = { className?: string; "aria-hidden"?: boolean };

function Svg({ className, children, ...rest }: IconProps & { children: React.ReactNode }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden={rest["aria-hidden"] ?? true}
            className={cn("size-5 shrink-0", className)}
        >
            {children}
        </svg>
    );
}

/** A Buddy's face in a bubble: a person, "about me". */
export function IconBuddy(props: IconProps) {
    return (
        <Svg {...props}>
            <path d={bubblePath(3, 3, 18, 18, "bl", 8, 2)} />
            <path d="M9.5 9.5v2M14.5 9.5v2" />
            <path d="M9.3 14.6q2.7 2.2 5.4 0" />
        </Svg>
    );
}

/** A bubble saying a heart: things you love. */
export function IconBubbleHeart(props: IconProps) {
    return (
        <Svg {...props}>
            <path d={bubblePath(3, 3, 18, 17, "br", 7.5, 2)} />
            <path d="M12 15.2c-2.6-1.6-4-3-4-4.6a2 2 0 0 1 4-.7 2 2 0 0 1 4 .7c0 1.6-1.4 3-4 4.6z" />
        </Svg>
    );
}

/** A bubble with two dials: preferences. */
export function IconBubbleDials(props: IconProps) {
    return (
        <Svg {...props}>
            <path d={bubblePath(3, 3, 18, 18, "tl", 8, 2)} />
            <path d="M7.5 9.5h9M7.5 14.5h9" />
            <circle cx="10" cy="9.5" r="1.7" fill="currentColor" stroke="none" />
            <circle cx="14.2" cy="14.5" r="1.7" fill="currentColor" stroke="none" />
        </Svg>
    );
}

/** A padlock whose body is a bubble: private, account. */
export function IconBubbleLock(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
            <path d={bubblePath(4, 10, 16, 11, "tr", 4, 1.2)} />
            <path d="M12 14.4v2.2" />
        </Svg>
    );
}

/** Camera with a bubble-shaped body: change photo. */
export function IconBubbleCamera(props: IconProps) {
    return (
        <Svg {...props}>
            <path d={bubblePath(3, 7, 18, 13, "bl", 4.5, 1.2)} />
            <path d="M8.5 7l1.3-2.2h4.4L15.5 7" />
            <circle cx="12" cy="13.5" r="3.2" />
        </Svg>
    );
}

/** A bubble turned on its tail so the tail points down: a place pin. */
export function IconBubblePin(props: IconProps) {
    return (
        <Svg {...props}>
            <path d={bubblePath(6, 3.5, 12, 12, "br", 5.6, 1.2)} transform="rotate(45 12 9.5)" />
            <circle cx="12" cy="9.5" r="2.1" />
        </Svg>
    );
}

/** Two overlapping bubbles, as in the logo: a conversation. */
export function IconTwoBubbles(props: IconProps) {
    const maskId = `tb-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const front = bubblePath(9, 10, 12.5, 10, "br", 4.6, 1.2);
    return (
        <Svg {...props}>
            <defs>
                <mask id={maskId}>
                    <rect width="24" height="24" fill="white" />
                    <path d={front} fill="black" stroke="black" strokeWidth={4} />
                </mask>
            </defs>
            <path d={bubblePath(2.5, 3.5, 12.5, 10, "bl", 4.6, 1.2)} mask={`url(#${maskId})`} />
            <path d={front} />
        </Svg>
    );
}

/** Envelope with one tail corner: email. */
export function IconBubbleMail(props: IconProps) {
    return (
        <Svg {...props}>
            <path d={bubblePath(3, 5, 18, 14, "bl", 3.5, 1.2)} />
            <path d="M4.5 7.5l7.5 5.2 7.5-5.2" />
        </Svg>
    );
}

/** Pencil finishing a little bubble: edit. */
export function IconBubbleEdit(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M14.8 4.6l3.6 3.6-8.6 8.6-4.3.8.8-4.3z" />
            <path d="M13 6.4l3.6 3.6" />
            <path d="M14 20h5.5" />
        </Svg>
    );
}

/** A "typing" bubble with a spark: a friendly tip. */
export function IconTypingSpark(props: IconProps) {
    return (
        <Svg {...props}>
            <path d={bubblePath(2.5, 6, 15, 13, "bl", 5.5, 1.2)} />
            <circle cx="6.6" cy="12.5" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="10" cy="12.5" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="13.4" cy="12.5" r="1.1" fill="currentColor" stroke="none" />
            <path d="M19.5 2.5q.5 2.5 3 3-2.5.5-3 3-.5-2.5-3-3 2.5-.5 3-3z" fill="currentColor" strokeWidth={1} />
        </Svg>
    );
}
