import { useState } from 'react';
import type { Room } from '@/src/app/tribus/hooks/useRoom';
import { emitFavoriteChange } from '@/src/app/tribus/utils/favoriteEvents';

export function useFavoriteRoom(roomId: string, initialIsFavorite: boolean = false, room?: Room) {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/rooms/${roomId}/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!res.ok) {
                throw new Error('Failed to toggle favorite');
            }
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
