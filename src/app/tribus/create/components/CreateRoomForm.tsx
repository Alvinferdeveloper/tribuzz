'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateRoom, RoomSchema, RoomFormValues, ROOM_LIMITS } from '../hooks/useCreateRoom';
import { useCategories } from '../hooks/useCategories';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Label } from '@/src/components/ui/label';
import { CategorySelector } from './CategorySelector';
import type { TribeDraft } from './TribePreview';
import { ArrowRight, CircleAlert } from 'lucide-react';
import { BubbleLoader } from "@/src/components/ui/bubble-loader";
import { cn } from '@/src/lib/utils';

export interface RoomData {
    id: string;
    name: string;
}

interface CreateRoomFormProps {
    onRoomCreated: (room: RoomData, draft: TribeDraft) => void;
    /** Live draft for the preview panel beside the form. */
    onDraftChange: (draft: TribeDraft) => void;
}

export function CreateRoomForm({ onRoomCreated, onDraftChange }: CreateRoomFormProps) {
    const { t } = useTranslation();
    const { createRoom, loading, error } = useCreateRoom();
    const { categories, loading: categoriesLoading } = useCategories();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RoomFormValues>({
        resolver: zodResolver(RoomSchema),
        defaultValues: { name: '', short_description: '', full_description: '' },
    });

    useEffect(() => {
        setValue('categoryIds', selectedCategories);
    }, [selectedCategories, setValue]);

    const name = watch('name') ?? '';
    const shortDescription = watch('short_description') ?? '';
    const fullDescription = watch('full_description') ?? '';

    const selectedKey = selectedCategories.join(',');
    const draft: TribeDraft = useMemo(() => ({
        name,
        // The explore card shows the long description, so preview that one.
        description: fullDescription || shortDescription,
        categories: categories.filter(c => selectedCategories.includes(c.id)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [name, fullDescription, shortDescription, categories, selectedKey]);

    useEffect(() => {
        onDraftChange(draft);
    }, [draft, onDraftChange]);

    const onSubmit = async (data: RoomFormValues) => {
        const newRoom = await createRoom(data);
        if (newRoom) onRoomCreated(newRoom, draft);
    };

    return (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-[var(--card-radius)] bg-card p-5 shadow-[var(--card-shadow)] ring-1 ring-border/70 sm:p-7">
                <h2 className="text-lg font-bold tracking-tight">{t('rooms.create.form.basic_info')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t('rooms.create.form.basic_info_desc')}</p>

                <div className="mt-6 space-y-5">
                    <Field
                        id="name"
                        label={t('rooms.create.form.name_label')}
                        count={name.length}
                        max={ROOM_LIMITS.name.max}
                        error={errors.name?.message}
                    >
                        <Input
                            id="name"
                            {...register('name')}
                            maxLength={ROOM_LIMITS.name.max}
                            aria-invalid={!!errors.name}
                            placeholder={t('rooms.create.form.name_placeholder')}
                        />
                    </Field>

                    <Field
                        id="short_description"
                        label={t('rooms.create.form.short_desc_label')}
                        count={shortDescription.length}
                        max={ROOM_LIMITS.short_description.max}
                        error={errors.short_description?.message}
                    >
                        <Input
                            id="short_description"
                            {...register('short_description')}
                            maxLength={ROOM_LIMITS.short_description.max}
                            aria-invalid={!!errors.short_description}
                            placeholder={t('rooms.create.form.short_desc_placeholder')}
                        />
                    </Field>

                    <Field
                        id="full_description"
                        label={t('rooms.create.form.full_desc_label')}
                        count={fullDescription.length}
                        max={ROOM_LIMITS.full_description.max}
                        error={errors.full_description?.message}
                    >
                        <Textarea
                            id="full_description"
                            {...register('full_description')}
                            maxLength={ROOM_LIMITS.full_description.max}
                            aria-invalid={!!errors.full_description}
                            className="min-h-[120px] resize-none"
                            placeholder={t('rooms.create.form.full_desc_placeholder')}
                        />
                    </Field>

                    <CategorySelector
                        categories={categories}
                        selectedIds={selectedCategories}
                        onChange={setSelectedCategories}
                        loading={categoriesLoading}
                    />
                    {errors.categoryIds && <FieldError message={errors.categoryIds.message} />}
                </div>

                {error && (
                    <div role="alert" className="mt-6 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
                        <CircleAlert className="mt-0.5 size-4 shrink-0" />
                        {t(error, { defaultValue: t('rooms.create.form.error') })}
                    </div>
                )}

                <Button type="submit" disabled={loading} size="lg" className="mt-7 h-12 w-full text-base">
                    {loading ? (
                        <>
                            <BubbleLoader size="sm" mono />
                            {t('rooms.create.form.creating')}
                        </>
                    ) : (
                        <>
                            {t('rooms.create.form.continue')}
                            <ArrowRight className="size-4" />
                        </>
                    )}
                </Button>
            </form>
    );
}

function Field({ id, label, count, max, error, children }: {
    id: string;
    label: string;
    count: number;
    max: number;
    error?: string;
    children: React.ReactNode;
}) {
    const nearLimit = count > max * 0.85;
    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor={id} className="text-sm font-semibold">{label}</Label>
                <span className={cn("text-xs tabular-nums text-muted-foreground transition-colors", nearLimit && "text-tribe-coral-ink")}>
                    {count}/{max}
                </span>
            </div>
            {children}
            {error && <FieldError message={error} />}
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    return (
        <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
            <CircleAlert className="size-3.5 shrink-0" />
            {message}
        </p>
    );
}
