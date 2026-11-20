'use client';

import { IMAGE_ACCEPT } from "@/src/lib/uploads";
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Room } from '@/src/app/tribus/hooks/useRoom';
import { useUpdateRoom } from '@/src/app/tribus/hooks/useUpdateRoom';
import { useCreateRoom, ROOM_LIMITS } from '@/src/app/tribus/create/hooks/useCreateRoom';
import { useCategories } from '@/src/app/tribus/create/hooks/useCategories';
import { CategorySelector } from '@/src/app/tribus/create/components/CategorySelector';
import { RoomCardBanner } from '@/src/app/tribus/components/RoomCardBanner';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { BubbleLoader } from "@/src/components/ui/bubble-loader";
import { IconBubbleCamera } from '@/src/app/components/brand/icons';
import { cn } from '@/src/lib/utils';

interface RoomEditDialogProps {
    room: Room;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate?: (roomId: string, updates: Partial<Room>) => void;
    onUpdateCategories?: (roomId: string, categoryIds: string[]) => Promise<any>;
}

type TextField = 'name' | 'short_description' | 'full_description';
const TEXT_FIELDS: TextField[] = ['name', 'short_description', 'full_description'];

/** Same limits as creating a tribe (and the API). */
function isValidLength(field: TextField, value: string) {
    const { min, max } = ROOM_LIMITS[field];
    return value.trim().length >= min && value.length <= max;
}

/**
 * Edit a tribe you own: the top is the tribe's real card banner and icon,
 * editable in place (so you see exactly what people will see), then its
 * texts and categories. Stays open with a message if saving fails.
 */
export function RoomEditDialog({ room, open, onOpenChange, onUpdate, onUpdateCategories }: RoomEditDialogProps) {
    const { t } = useTranslation();
    const { updateRoom } = useUpdateRoom();
    const { uploadRoomImage, uploading } = useCreateRoom();
    const { categories: allCategories, loading: categoriesLoading } = useCategories();

    const initialText = () => ({
        name: room.name,
        short_description: room.short_description,
        full_description: room.full_description,
    });
    const initialCategories = () => room.categories?.map(c => c.id) || [];

    const [form, setForm] = useState<Record<TextField, string>>(initialText);
    const [categoryIds, setCategoryIds] = useState<string[]>(initialCategories);
    const [banner, setBanner] = useState<{ file: File; url: string } | null>(null);
    const [icon, setIcon] = useState<{ file: File; url: string } | null>(null);
    const [saving, setSaving] = useState(false);

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const iconInputRef = useRef<HTMLInputElement>(null);

    // Fresh copy of the tribe every time the dialog opens.
    useEffect(() => {
        if (!open) return;
        setForm(initialText());
        setCategoryIds(initialCategories());
        setBanner(null);
        setIcon(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, room]);

    const pickImage = (event: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'icon') => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        const next = { file, url: URL.createObjectURL(file) };
        if (type === 'banner') setBanner(next); else setIcon(next);
    };

    const changedFields = TEXT_FIELDS.filter(f => form[f] !== (room[f] ?? ''));
    const categoriesChanged = [...initialCategories()].sort().join() !== [...categoryIds].sort().join();
    const dirty = changedFields.length > 0 || categoriesChanged || Boolean(banner || icon);
    const invalid = TEXT_FIELDS.some(f => !isValidLength(f, form[f]));

    const handleSave = async () => {
        setSaving(true);
        const updates: Partial<Room> = {};
        try {
            for (const [type, picked] of [['banner', banner], ['icon', icon]] as const) {
                if (!picked) continue;
                const result = await uploadRoomImage(room.id, type, picked.file);
                if (!result.success || !result.publicUrl) throw new Error('UPLOAD_FAILED');
                updates[type === 'banner' ? 'server_banner' : 'server_icon'] = result.publicUrl;
            }
            for (const field of changedFields) {
                await updateRoom(room.id, field, form[field]);
                updates[field] = form[field];
            }
            if (categoriesChanged) await onUpdateCategories?.(room.id, categoryIds);

            toast.success(t('rooms.edit.saved'));
            onOpenChange(false);
        } catch (err: any) {
            toast.error(t(err?.message || 'ROOM_UPDATE_ERROR', { defaultValue: t('rooms.edit.error') }));
        } finally {
            // Whatever did save is reflected on the card, even if a later step failed.
            if (Object.keys(updates).length > 0) onUpdate?.(room.id, updates);
            setSaving(false);
        }
    };

    const busy = saving || Boolean(uploading);

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
            <DialogContent
                className="flex max-h-[min(92dvh,780px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {/* The card's own banner and icon, editable in place */}
                    <div className="relative">
                        <RoomCardBanner
                            roomName={form.name || room.name}
                            serverBanner={banner?.url ?? room.server_banner}
                            serverIcon={icon?.url ?? room.server_icon}
                        >
                            <button
                                type="button"
                                onClick={() => bannerInputRef.current?.click()}
                                disabled={busy}
                                className="absolute bottom-3 right-3 z-10 inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-[oklch(0.16_0.04_265/0.6)] px-3.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-md transition-colors hover:bg-[oklch(0.16_0.04_265/0.75)]"
                            >
                                {uploading === 'banner' ? <BubbleLoader size="sm" mono /> : <IconBubbleCamera className="size-4" />}
                                {t('rooms.edit.change_banner')}
                            </button>
                        </RoomCardBanner>
                        {/* Over the card icon's corner (the icon sits at left-4, 48px). */}
                        <button
                            type="button"
                            onClick={() => iconInputRef.current?.click()}
                            disabled={busy}
                            aria-label={t('rooms.edit.change_icon')}
                            className="absolute left-[52px] -bottom-7 z-20 flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--btn-primary-shadow)] ring-[3px] ring-background transition-transform hover:scale-105 active:scale-95"
                        >
                            {uploading === 'icon' ? <BubbleLoader size="sm" mono /> : <IconBubbleCamera className="size-4" />}
                        </button>
                        <input type="file" ref={bannerInputRef} onChange={(e) => pickImage(e, 'banner')} className="hidden" accept={IMAGE_ACCEPT} />
                        <input type="file" ref={iconInputRef} onChange={(e) => pickImage(e, 'icon')} className="hidden" accept={IMAGE_ACCEPT} />
                    </div>

                    <div className="px-5 pb-6 pt-10 sm:px-7">
                        <DialogTitle className="text-xl font-bold tracking-tight">{t('rooms.edit.title')}</DialogTitle>
                        <DialogDescription className="mt-1 text-sm text-muted-foreground">{t('rooms.edit.description')}</DialogDescription>

                        <div className="mt-6 space-y-5">
                            <TextInput
                                id="edit-name"
                                label={t('rooms.edit.name_label')}
                                field="name"
                                value={form.name}
                                onChange={(v) => setForm(f => ({ ...f, name: v }))}
                            />
                            <TextInput
                                id="edit-short"
                                label={t('rooms.edit.short_desc_label')}
                                field="short_description"
                                value={form.short_description}
                                onChange={(v) => setForm(f => ({ ...f, short_description: v }))}
                            />
                            <TextInput
                                id="edit-full"
                                label={t('rooms.edit.full_desc_label')}
                                field="full_description"
                                value={form.full_description}
                                onChange={(v) => setForm(f => ({ ...f, full_description: v }))}
                                multiline
                            />
                            <CategorySelector
                                categories={allCategories}
                                selectedIds={categoryIds}
                                onChange={setCategoryIds}
                                loading={categoriesLoading}
                            />
                        </div>
                    </div>
                </div>

                <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-5 py-4 sm:px-7">
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
                        {t('rooms.edit.cancel')}
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={!dirty || invalid || busy} className="min-w-[132px]">
                        {busy && <BubbleLoader size="sm" mono />}
                        {busy ? t('rooms.edit.saving') : t('rooms.edit.save')}
                    </Button>
                </footer>
            </DialogContent>
        </Dialog>
    );
}

function TextInput({ id, label, field, value, onChange, multiline = false }: {
    id: string;
    label: string;
    field: TextField;
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
}) {
    const { t } = useTranslation();
    const { min, max } = ROOM_LIMITS[field];
    const tooShort = value.trim().length < min;
    const Control = multiline ? Textarea : Input;

    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor={id} className="text-sm font-semibold">{label}</Label>
                <span className={cn("text-xs tabular-nums text-muted-foreground", value.length > max * 0.85 && "text-tribe-coral-ink")}>
                    {value.length}/{max}
                </span>
            </div>
            <Control
                id={id}
                value={value}
                maxLength={max}
                aria-invalid={tooShort}
                onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => onChange(e.target.value)}
                className={multiline ? "min-h-[110px] resize-none" : "h-11"}
            />
            {tooShort && <p className="text-sm font-medium text-destructive">{t('rooms.edit.min_length', { count: min })}</p>}
        </div>
    );
}
