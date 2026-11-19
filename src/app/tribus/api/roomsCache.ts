import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { Paginated } from '@/src/lib/api/client';
import type { Room, RoomListFilters } from './rooms';
import { roomKeys } from './queryKeys';

/**
 * Cache updates for tribe lists after a change made elsewhere, so cached
 * screens show the right state when you come back to them.
 */

type RoomPages = InfiniteData<Paginated<Room>, number>;

const isFavoritesList = (queryKey: readonly unknown[]) =>
    (queryKey[2] as RoomListFilters | undefined)?.type === 'favorites';

/** Patch one tribe in every cached list it appears in. */
function patchRoomInLists(queryClient: QueryClient, roomId: string, patch: Partial<Room>) {
    queryClient.setQueriesData<RoomPages>({ queryKey: roomKeys.lists() }, (data) =>
        data && {
            ...data,
            pages: data.pages.map((page) => ({
                ...page,
                data: page.data.map((room) => (room.id === roomId ? { ...room, ...patch } : room)),
            })),
        }
    );
}

/**
 * A tribe was (un)favorited: its heart is updated in place in every cached
 * list, and the favorites lists (whose members changed) are refetched.
 */
export function syncFavoriteInCache(queryClient: QueryClient, roomId: string, isFavorite: boolean) {
    patchRoomInLists(queryClient, roomId, { isFavorite });
    queryClient.invalidateQueries({
        queryKey: roomKeys.lists(),
        predicate: (query) => isFavoritesList(query.queryKey),
    });
}
