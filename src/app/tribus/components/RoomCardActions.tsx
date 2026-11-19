'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Room } from '@/src/app/tribus/hooks/useRoom';
import { Settings, Trash2, Heart } from 'lucide-react';
import { RoomEditDialog } from '@/src/app/tribus/components/RoomEditDialog';
import { ConfirmDialog } from '@/src/app/components/shared/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '@/src/lib/utils';

interface RoomCardActionsProps {
    room: Room;
    isOwner: boolean;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void;
    onDelete?: (roomId: string) => Promise<void>;
    onUpdate?: (roomId: string, updates: Partial<Room>) => void;
    onUpdateCategories?: (roomId: string, categoryIds: string[]) => Promise<any>;
}

// Over artwork of unknown brightness, so these keep a dark translucent base
// in both themes; it is the one place a scrim is functional, not decorative.
const overlayButton =
    "flex size-8 cursor-pointer items-center justify-center rounded-full bg-[oklch(0.16_0.04_265/0.5)] text-white backdrop-blur-sm transition-[background-color,transform] duration-150 ease-out hover:bg-[oklch(0.16_0.04_265/0.7)] active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

export function RoomCardActions({ room, isOwner, isFavorite, onToggleFavorite, onDelete, onUpdate, onUpdateCategories }: RoomCardActionsProps) {
    const { t } = useTranslation();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { session } = useAuth();

    const handleDelete = async () => {
        if (!onDelete) return;
        setIsDeleting(true);
        try {
            await onDelete(room.id);
        } finally {
            setIsDeleting(false);
            setIsConfirmOpen(false);
        }
    };

    return (
        // Dialogs are portaled, but React events still bubble through the
        // component tree: stop them here so clicks inside never "join" the card.
        <div className="absolute top-2.5 right-2.5 z-20 flex gap-1.5" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            {isOwner && (
                <>
                    <button
                        onClick={() => setIsEditDialogOpen(true)}
                        className={cn(overlayButton, "group/settings")}
                        aria-label={t('rooms.card.edit_label')}
                    >
                        <Settings className="size-4 transition-transform duration-300 ease-out group-hover/settings:rotate-45" />
                    </button>

                    {onDelete && (
                        <button
                            onClick={() => setIsConfirmOpen(true)}
                            className={cn(overlayButton, "hover:bg-destructive")}
                            aria-label={t('rooms.card.delete_label')}
                        >
                            <Trash2 className="size-4" />
                        </button>
                    )}

                    <RoomEditDialog
                        room={room}
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        onUpdate={onUpdate}
                        onUpdateCategories={onUpdateCategories}
                    />
                    <ConfirmDialog
                        isOpen={isConfirmOpen}
                        onClose={() => setIsConfirmOpen(false)}
                        onConfirm={handleDelete}
                        title={t('rooms.card.delete_label')}
                        description={t('rooms.card.confirm_delete')}
                        confirmText={t('rooms.card.delete_confirm')}
                        variant="destructive"
                        isLoading={isDeleting}
                    />
                </>
            )}

            {session?.user && (
                <button
                    onClick={(e) => onToggleFavorite(e)}
                    className={cn(overlayButton, "group/heart")}
                    aria-label={isFavorite ? t('rooms.card.remove_fav') : t('rooms.card.add_fav')}
                    aria-pressed={isFavorite}
                >
                    <Heart
                        className={cn(
                            "size-4 transition-[color,fill,transform] duration-200 ease-out",
                            isFavorite ? "scale-110 fill-tribe-coral text-tribe-coral" : "group-hover/heart:text-tribe-coral"
                        )}
                    />
                </button>
            )}
        </div>
    );
}
