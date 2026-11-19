'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, FieldValues, Path } from 'react-hook-form';
import { Check, Plus } from 'lucide-react';
import { TopicGlyph } from '@/src/app/components/brand/TopicGlyph';
import { motion, AnimatePresence } from 'framer-motion';
import { tribeTone } from '@/src/app/utils/tribeColor';
import { EditActions, EditButton } from './EditableField';
import { cn } from '@/src/lib/utils';

interface Hobby {
    id: string;
    name: string;
    icon: string | null;
}

interface EditableHobbiesProps<T extends FieldValues, Name extends Path<T> = Path<T>> {
    name: Name;
    label: string;
    userHobbies: Hobby[] | undefined;
    allHobbies: Hobby[];
    hobbiesLoading: boolean;
    control: Control<T>;
    updateFn: (field: Name, value: any) => Promise<void>;
    readOnly?: boolean;
    /** Shown when a read-only profile has no hobbies. */
    emptyText?: string;
}

/**
 * Hobbies as chips in the logo colors (each hobby always wears the same one).
 * Editing turns the whole catalogue into toggles in place.
 */
export function EditableHobbies<T extends FieldValues, Name extends Path<T> = Path<T>>({
    name,
    label,
    userHobbies,
    allHobbies,
    hobbiesLoading,
    updateFn,
    readOnly = false,
    emptyText,
}: EditableHobbiesProps<T, Name>) {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedHobbyIds, setSelectedHobbyIds] = useState<string[]>([]);

    useEffect(() => {
        if (!isEditing) {
            setSelectedHobbyIds(userHobbies?.map(h => h.id) || []);
        }
    }, [userHobbies, isEditing]);

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const hobbiesToSave = allHobbies.filter(hobby => selectedHobbyIds.includes(hobby.id));
        await updateFn(name, hobbiesToSave);
        setIsSaving(false);
        setIsEditing(false);
    };

    const toggleHobby = (hobbyId: string) => {
        setSelectedHobbyIds(prev =>
            prev.includes(hobbyId) ? prev.filter(id => id !== hobbyId) : [...prev, hobbyId]
        );
    };

    return (
        <div className="group">
            {(label || (!isEditing && !readOnly)) && (
                <div className="mb-3 flex items-center justify-between gap-3">
                    {label && <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>}
                    {!isEditing && !readOnly && (
                        <span className="ml-auto"><EditButton onClick={() => setIsEditing(true)} label={t('profile.editable.edit', { field: t('profile.hobbies_title') })} /></span>
                    )}
                </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
                {!isEditing ? (
                    <motion.div
                        key="view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-wrap gap-2"
                    >
                        {userHobbies && userHobbies.length > 0 ? (
                            userHobbies.map((hobby) => {
                                const tone = tribeTone(hobby.name);
                                return (
                                    <span key={hobby.id} className={cn("inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold", tone.soft, tone.ink)}>
                                        <TopicGlyph name={hobby.name} icon={hobby.icon} className="size-4" />
                                        {hobby.name}
                                    </span>
                                );
                            })
                        ) : readOnly ? (
                            <p className="text-sm text-muted-foreground">{emptyText ?? t('profile.editable.no_hobbies')}</p>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-dashed border-muted-foreground/40 px-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
                            >
                                <Plus className="size-4" />
                                {t('profile.editable.add_hobbies')}
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.form
                        key="edit"
                        initial={{ opacity: 0, transform: 'translateY(4px)' }}
                        animate={{ opacity: 1, transform: 'translateY(0px)' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onSubmit={onSave}
                    >
                        {hobbiesLoading ? (
                            <div aria-hidden="true" className="flex flex-wrap gap-2">
                                {[96, 72, 110, 84, 64, 100, 78, 90].map((w, i) => (
                                    <div key={i} className="h-9 animate-pulse rounded-full bg-muted" style={{ width: w }} />
                                ))}
                            </div>
                        ) : (
                            <div role="group" aria-label={t('profile.hobbies_title')} className="flex flex-wrap gap-2">
                                {allHobbies.map((hobby) => {
                                    const selected = selectedHobbyIds.includes(hobby.id);
                                    const tone = tribeTone(hobby.name);
                                    return (
                                        <button
                                            key={hobby.id}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => toggleHobby(hobby.id)}
                                            className={cn(
                                                "inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 text-sm font-semibold",
                                                "transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.97]",
                                                selected
                                                    ? cn(tone.soft, tone.ink, "ring-2", tone.ring)
                                                    : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground hover:ring-muted-foreground/40"
                                            )}
                                        >
                                            {selected ? <Check className="size-4" strokeWidth={2.5} /> : <TopicGlyph name={hobby.name} icon={hobby.icon} className="size-4" />}
                                            {hobby.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <EditActions
                            saving={isSaving}
                            onCancel={() => setIsEditing(false)}
                            saveLabel={t('profile.editable.save_hobbies')}
                        />
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
