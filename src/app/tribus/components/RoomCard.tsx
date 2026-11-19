'use client';

import { Room } from '@/src/app/tribus/hooks/useRoom';
import { motion, Variants } from 'framer-motion';
import { useFavoriteRoom } from '@/src/app/tribus/hooks/useFavoriteRoom';
import { useAuth } from '@/src/app/hooks/useAuth';
import { cn } from '@/src/lib/utils';

import { RoomCardBanner } from '@/src/app/tribus/components/RoomCardBanner';
import { RoomCardActions } from '@/src/app/tribus/components/RoomCardActions';
import { RoomCardContent } from '@/src/app/tribus/components/RoomCardContent';

/**
 * Entrance for room grids. The stagger restarts for every page of results
 * (index % 12) and is capped, so cards loaded by infinite scroll don't wait
 * seconds for their turn the way a raw `index * delay` made them.
 */
export const roomCardVariants: Variants = {
    hidden: { opacity: 0, transform: 'translateY(10px)' },
    visible: (i: number) => ({
        opacity: 1,
        transform: 'translateY(0px)',
        transition: {
            delay: Math.min(i % 12, 8) * 0.035,
            duration: 0.32,
            ease: [0.23, 1, 0.32, 1],
        },
    }),
};

interface RoomCardProps {
    room: Room;
    index: number;
    userCount: number;
    isConnecting: boolean;
    onJoin: (roomId: string) => void;
    cardVariants?: Variants;
    footer?: React.ReactNode;
    onDelete?: (roomId: string) => Promise<any>;
    onUpdate?: (roomId: string, updates: Partial<Room>) => void;
    onUpdateCategories?: (roomId: string, categoryIds: string[]) => Promise<any>;
}

export function RoomCard({
    room,
    index,
    userCount,
    isConnecting,
    onJoin,
    cardVariants = roomCardVariants,
    footer,
    onDelete,
    onUpdate,
    onUpdateCategories,
}: RoomCardProps) {
    const { isFavorite, toggleFavorite } = useFavoriteRoom(room.id, room.isFavorite, room);
    const { session } = useAuth();

    const id1 = String(session?.user?.id).trim();
    const id2 = String(room?.ownerId).trim();
    const isOwner = Boolean(id1) && id1 === id2;

    const join = () => onJoin(room.id);

    return (
        <motion.div
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="h-full"
        >
            <article
                role="link"
                tabIndex={0}
                aria-label={room.name}
                onClick={join}
                onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        join();
                    }
                }}
                className={cn(
                    "group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[10px] bg-card text-card-foreground",
                    "ring-1 ring-border/70 shadow-[0_1px_2px_var(--shadow-tint)]",
                    "transition-[transform,box-shadow] duration-200 ease-out",
                    "[@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[0_2px_4px_var(--shadow-tint),0_18px_36px_-18px_var(--shadow-tint)]",
                    "active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    isConnecting && "pointer-events-none opacity-80"
                )}
            >
                <RoomCardBanner
                    roomName={room.name}
                    serverBanner={room.server_banner}
                    serverIcon={room.server_icon}
                >
                    <RoomCardActions
                        room={room}
                        isOwner={isOwner}
                        isFavorite={isFavorite}
                        onToggleFavorite={toggleFavorite}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                        onUpdateCategories={onUpdateCategories}
                    />
                </RoomCardBanner>

                <RoomCardContent
                    name={room.name}
                    description={room.full_description}
                    verified={room.verified}
                    userCount={userCount}
                    isConnecting={isConnecting}
                    categories={room.categories}
                    footer={footer}
                />
            </article>
        </motion.div>
    );
}
