"use client";

import { useEffect, useRef } from "react";

/**
 * Pauses every `.brand-anim` inside the returned ref's element while the tab
 * is hidden or the element is scrolled out of view, so decorative motion
 * never burns battery off-screen. Works through `[data-paused="true"]`
 * (see Brand motion in globals.css).
 */
export function usePauseWhenHidden<T extends HTMLElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let inView = true;

        const sync = () => {
            el.dataset.paused = document.hidden || !inView ? "true" : "false";
        };

        const observer = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            sync();
        });
        observer.observe(el);
        document.addEventListener("visibilitychange", sync);
        sync();

        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", sync);
        };
    }, []);

    return ref;
}
