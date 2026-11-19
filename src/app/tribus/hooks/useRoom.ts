'use client';

import { useCallback } from 'react';
import { errorCode } from '@/src/lib/api/client';
import { useRoomsInfinite } from '@/src/app/tribus/hooks/useRoomsInfinite';
import type { RoomFetchType } from '@/src/app/tribus/api/rooms';

// Domain types live with the API module; re-exported for existing imports.
export type { Room, RoomStatus, RoomFetchType } from '@/src/app/tribus/api/rooms';

/**
 * Tribe list for screens with infinite scroll (explore, favorites, the
 * rail, the landing). Keeps the shape screens already use (rooms, loading,
 * hasMore, loadMoreRooms, retry, error code) on top of the cached
 * useRoomsInfinite query.
 */
export default function useRoom(searchQuery: string = '', type: RoomFetchType = 'all') {
    const {
        rooms, error, isPending, isFetchingNextPage, hasNextPage, fetchNextPage, refetch,
    } = useRoomsInfinite({ type, search: searchQuery });

    const loadMoreRooms = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // With pages on screen, retry the page that failed; otherwise start over.
    const retry = useCallback(() => {
        if (rooms.length > 0) fetchNextPage();
        else refetch();
    }, [rooms.length, fetchNextPage, refetch]);

    return {
        rooms,
        error: error ? errorCode(error, 'ROOMS_GENERIC_ERROR') : '',
        // First load or the next page; background refreshes don't count, so
        // they never bring back skeletons or the bottom loader.
        loading: isPending || isFetchingNextPage,
        hasMore: Boolean(hasNextPage),
        loadMoreRooms,
        retry,
    };
}
