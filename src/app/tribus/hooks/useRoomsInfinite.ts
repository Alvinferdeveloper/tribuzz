'use client';

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchRoomsPage, type Room, type RoomListFilters } from '@/src/app/tribus/api/rooms';
import { roomKeys } from '@/src/app/tribus/api/queryKeys';

/**
 * A paginated tribe list (explore or favorites, optionally searched),
 * cached per filter combination: leaving /tribus and coming back shows the
 * pages already loaded right away and refreshes them in the background once
 * they're stale, instead of starting over from an empty skeleton.
 */
export function useRoomsInfinite(filters: RoomListFilters, { enabled = true }: { enabled?: boolean } = {}) {
    const query = useInfiniteQuery({
        queryKey: roomKeys.list(filters),
        queryFn: ({ pageParam }) => fetchRoomsPage(filters, pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage, _pages, lastPageParam) =>
            lastPage.pagination.hasNextPage ? lastPageParam + 1 : undefined,
        enabled,
    });

    // Pages flattened into one list. Deduplicated by id: if tribes are added
    // while scrolling, offset pagination can return one again on the next page.
    const rooms = useMemo<Room[]>(() => {
        const seen = new Set<string>();
        const list: Room[] = [];
        for (const page of query.data?.pages ?? []) {
            for (const room of page.data) {
                if (!seen.has(room.id)) {
                    seen.add(room.id);
                    list.push(room);
                }
            }
        }
        return list;
    }, [query.data]);

    return { ...query, rooms };
}
