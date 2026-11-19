"use client";

import { useEffect, useRef } from "react";

/** The keyboard is "open" when the visible area is this much shorter than its tallest. */
const KEYBOARD_THRESHOLD_PX = 120;

/**
 * Pins the chat to the part of the screen the user can actually see, so the
 * input stays glued to the bottom (or to the top of the keyboard):
 *
 * - Locks page scrolling while the chat is mounted (`html.chat-viewport-lock`),
 *   so overscrolling the message list can't drag the whole page and leave a
 *   gap under the input.
 * - Mirrors `visualViewport` into CSS variables on the chat root:
 *   `--chat-vh` (visible height) and `--chat-vt` (how far the browser panned
 *   the visible area). Android already resizes the layout thanks to
 *   `interactive-widget=resizes-content`; iOS Safari doesn't, it pans the
 *   page when the keyboard opens, which is what pushed the input around.
 * - Sets `data-keyboard="open"` while the keyboard is up, so the input can
 *   drop the home-indicator safe-area padding (otherwise a ~34px gap shows
 *   between the input and the keyboard on iPhones).
 */
export function useChatViewport<T extends HTMLElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.add("chat-viewport-lock");

        const el = ref.current;
        const vv = window.visualViewport;
        let tallest = 0;
        let lastWidth = 0;
        let frame = 0;

        const update = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                if (!el) return;
                const width = vv?.width ?? window.innerWidth;
                const height = vv?.height ?? window.innerHeight;
                // Rotation changes what "full height" means.
                if (Math.abs(width - lastWidth) > 1) {
                    tallest = 0;
                    lastWidth = width;
                }
                tallest = Math.max(tallest, height);

                el.style.setProperty("--chat-vh", `${Math.round(height)}px`);
                el.style.setProperty("--chat-vt", `${Math.round(vv?.offsetTop ?? 0)}px`);
                el.dataset.keyboard = tallest - height > KEYBOARD_THRESHOLD_PX ? "open" : "closed";
            });
        };

        update();
        vv?.addEventListener("resize", update);
        vv?.addEventListener("scroll", update);
        window.addEventListener("resize", update);

        return () => {
            cancelAnimationFrame(frame);
            vv?.removeEventListener("resize", update);
            vv?.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
            root.classList.remove("chat-viewport-lock");
        };
    }, []);

    return ref;
}
