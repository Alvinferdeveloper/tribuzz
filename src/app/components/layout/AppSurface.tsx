'use client';

import { useEffect } from 'react';

/**
 * Opts a route into the Tribuzz brand surface (tokens + `app:` variant in
 * globals.css). The wrapper attribute paints the right tokens on the first
 * server render; mirroring it on <html> makes portaled UI (dialogs, sheets,
 * dropdowns, toasts) pick up the same tokens, since they render outside the
 * wrapper. Routes without it (the landing) keep their original look.
 */
export function AppSurface({ children, className }: { children: React.ReactNode; className?: string }) {
    useEffect(() => {
        const root = document.documentElement;
        root.dataset.surface = 'app';
        return () => {
            delete root.dataset.surface;
        };
    }, []);

    return (
        <div data-surface="app" className={className}>
            {children}
        </div>
    );
}
