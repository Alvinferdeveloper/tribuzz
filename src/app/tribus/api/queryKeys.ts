import type { RoomListFilters } from './rooms';

/**
 * Query key factories for the tribes feature. Keys are hierarchical, so a
 * broad key invalidates everything under it:
 *   roomKeys.all     → every tribe query
 *   roomKeys.lists() → every tribe list (explore, favorites, each search)
 *   roomKeys.list(f) → one list
 */
export const roomKeys = {
    all: ['rooms'] as const,
    lists: () => [...roomKeys.all, 'list'] as const,
    list: (filters: RoomListFilters) => [...roomKeys.lists(), filters] as const,
};

export const categoryKeys = {
    all: ['categories'] as const,
    list: (search = '') => [...categoryKeys.all, 'list', search] as const,
};
