import { apiFetch, type Paginated } from '@/src/lib/api/client';

export type RoomStatus = 'IN_REVISION' | 'ACCEPTED' | 'REJECTED';

export type Room = {
    id: string;
    name: string;
    short_description: string;
    verified: boolean;
    full_description: string;
    isFavorite: boolean;
    server_banner: string;
    server_icon: string;
    status: RoomStatus;
    ownerId: string;
    created_at: string;
    categories?: { id: string; name: string; icon: string | null }[];
};

/** Which list of tribes: everything explorable, or the user's favorites. */
export type RoomFetchType = 'all' | 'favorites';

export interface RoomListFilters {
    type: RoomFetchType;
    search: string;
}

export const ROOMS_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_ROOMS_FETCH_LIMIT || 10);

const LIST_PATH: Record<RoomFetchType, string> = {
    all: '/api/v1/rooms',
    favorites: '/api/v1/rooms/favorites',
};

/** One page of a tribe list. */
export function fetchRoomsPage({ type, search }: RoomListFilters, page: number): Promise<Paginated<Room>> {
    return apiFetch<Paginated<Room>>(LIST_PATH[type], {
        query: { page, limit: ROOMS_PAGE_SIZE, q: search },
        fallbackError: 'ROOMS_LOAD_ERROR',
    });
}

/** Adds the tribe to the user's favorites, or removes it if it was one. */
export function toggleRoomFavorite(roomId: string): Promise<unknown> {
    return apiFetch(`/api/v1/rooms/${roomId}/favorite`, { method: 'POST', fallbackError: 'FAVORITE_TOGGLE_ERROR' });
}
