"use client";

import { useCallback, useRef, useState } from "react";

/** Drag distance (px) that triggers the reply. */
const TRIGGER_PX = 56;
/** Furthest the bubble follows the finger. */
const MAX_PX = 84;
/** Movement needed before deciding between a swipe and a scroll. */
const LOCK_PX = 8;

/**
 * Swipe a message to the right to reply, like WhatsApp or Telegram.
 * Horizontal drags move the bubble (with resistance past the trigger point);
 * vertical drags are left to the scroll. Past the trigger it buzzes once
 * (where supported) and replies on release.
 *
 * Pair with `touch-action: pan-y` on the element so the browser keeps
 * vertical scrolling and leaves horizontal movement to us.
 */
export function useSwipeToReply(onReply: () => void, enabled = true) {
    const [offset, setOffset] = useState(0);
    const [dragging, setDragging] = useState(false);
    const start = useRef<{ x: number; y: number } | null>(null);
    const axis = useRef<"x" | "y" | null>(null);
    const armed = useRef(false);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        if (!enabled || e.touches.length !== 1) return;
        start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        axis.current = null;
        armed.current = false;
    }, [enabled]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (!start.current) return;
        const dx = e.touches[0].clientX - start.current.x;
        const dy = e.touches[0].clientY - start.current.y;

        if (!axis.current) {
            if (Math.abs(dx) < LOCK_PX && Math.abs(dy) < LOCK_PX) return;
            axis.current = dx > 0 && Math.abs(dx) > Math.abs(dy) * 1.4 ? "x" : "y";
            if (axis.current === "x") setDragging(true);
        }
        if (axis.current !== "x") return;

        const distance = Math.max(0, dx);
        // Follows the finger up to the trigger, then resists.
        const eased = distance <= TRIGGER_PX ? distance : TRIGGER_PX + (distance - TRIGGER_PX) * 0.35;
        setOffset(Math.min(eased, MAX_PX));

        const nowArmed = distance >= TRIGGER_PX;
        if (nowArmed && !armed.current) navigator.vibrate?.(10);
        armed.current = nowArmed;
    }, []);

    const onTouchEnd = useCallback(() => {
        if (axis.current === "x" && armed.current) onReply();
        start.current = null;
        axis.current = null;
        armed.current = false;
        setDragging(false);
        setOffset(0);
    }, [onReply]);

    return {
        offset,
        /** 0…1, how close the swipe is to triggering (for the reply icon). */
        progress: Math.min(offset / TRIGGER_PX, 1),
        dragging,
        handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd },
    };
}
