import type { Room } from '@/src/app/tribus/hooks/useRoom';

/**
 * Tiny in-page broadcast for favorite toggles. Each list that shows
 * favorites (the tribe rail, for now) fetches and caches its own copy, so
 * without this a heart tapped on a card only showed up in the rail after a
 * navigation refetched it. Emitting is optimistic (on tap), and the hook
 * emits the reverse change if the request fails.
 */
export type FavoriteChange = {
    roomId: string;
    isFavorite: boolean;
    /** Present when known, so a new favorite can be drawn without a refetch. */
    room?: Room;
};

const EVENT_NAME = 'tribuzz:favorite-change';
const FAVORITES_CACHE_PREFIX = 'rooms_cache:favorites:';

export function emitFavoriteChange(change: FavoriteChange) {
    if (typeof window === 'undefined') return;
    // The cached favorites page is now stale; drop it so the next mount refetches.
    try {
        Object.keys(window.sessionStorage)
            .filter((key) => key.startsWith(FAVORITES_CACHE_PREFIX))
            .forEach((key) => window.sessionStorage.removeItem(key));
    } catch {
        // sessionStorage unavailable (private mode): nothing cached to drop.
    }
    window.dispatchEvent(new CustomEvent<FavoriteChange>(EVENT_NAME, { detail: change }));
}

export function onFavoriteChange(listener: (change: FavoriteChange) => void) {
    const handler = (event: Event) => listener((event as CustomEvent<FavoriteChange>).detail);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
}
