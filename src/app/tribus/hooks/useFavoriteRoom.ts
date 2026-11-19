import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Room } from '@/src/app/tribus/hooks/useRoom';
import { toggleRoomFavorite } from '@/src/app/tribus/api/rooms';
import { syncFavoriteInCache } from '@/src/app/tribus/api/roomsCache';
import { emitFavoriteChange } from '@/src/app/tribus/utils/favoriteEvents';

export function useFavoriteRoom(roomId: string, initialIsFavorite: boolean = false, room?: Room) {
    const queryClient = useQueryClient();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        // Optimistic update, broadcast so other favorite lists (the rail)
        // reflect it immediately too.
        const previousState = isFavorite;
        const nextState = !isFavorite;
        setIsFavorite(nextState);
        emitFavoriteChange({ roomId, isFavorite: nextState, room });
        setIsLoading(true);

        try {
            await toggleRoomFavorite(roomId);
            // Cached lists (explore, favorites) reflect it when you return to them.
            syncFavoriteInCache(queryClient, roomId, nextState);
        } catch (error) {
            // Revert on error, everywhere it was shown.
            console.error('Error toggling favorite:', error);
            setIsFavorite(previousState);
            emitFavoriteChange({ roomId, isFavorite: previousState, room });
        } finally {
            setIsLoading(false);
        }
    };

    return { isFavorite, toggleFavorite, isLoading };
}
