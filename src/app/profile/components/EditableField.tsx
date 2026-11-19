'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, FieldValues, Path } from 'react-hook-form';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Check } from 'lucide-react';
import { IconBubbleEdit } from '@/src/app/components/brand/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { BubbleLoader } from "@/src/components/ui/bubble-loader";
import { cn } from '@/src/lib/utils';

interface EditableFieldProps<T extends FieldValues, Name extends Path<T> = Path<T>> {
    name: Name;
    label: string;
    value: string | undefined;
    updateFn: (field: Name, value: any) => Promise<void>;
    isTextarea?: boolean;
    placeholder?: string;
    maxLength?: number;
    inputClassName?: string;
    labelClassName?: string;
    readOnly?: boolean;
    /** Shown in place of the value when it's empty and read-only. */
    emptyText?: string;
}

/** Pencil button shared by the editable rows: always visible on touch, on hover elsewhere. */
export function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[opacity,background-color,color,transform] duration-150 hover:bg-accent hover:text-foreground active:scale-95 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100"
        >
            <IconBubbleEdit className="size-[18px]" />
        </button>
    );
}

export function EditActions({ saving, onCancel, saveLabel }: { saving: boolean; onCancel: () => void; saveLabel?: string }) {
    const { t } = useTranslation();
    return (
        <div className="mt-3 flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>
                {saving ? <BubbleLoader size="sm" mono /> : <Check className="size-4" />}
                {saveLabel ?? t('profile.editable.save')}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
                {t('profile.editable.cancel')}
            </Button>
        </div>
    );
}

export function EditableField<T extends FieldValues, Name extends Path<T> = Path<T>>({
    name, label, value, updateFn, isTextarea = false,
    placeholder = '', maxLength, inputClassName = '', labelClassName = '',
    readOnly = false, emptyText,
}: EditableFieldProps<T, Name>) {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { control, handleSubmit, reset, watch } = useForm({
        defaultValues: { [name]: value }
    });

    const startEditing = () => {
        reset({ [name]: value });
        setIsEditing(true);
    };

    const onSave = async (data: FieldValues) => {
        setIsSaving(true);
        await updateFn(name, data[name]);
        setIsSaving(false);
        setIsEditing(false);
    };

    const draftLength = String(watch(name as string) ?? '').length;

    return (
        <div className="group py-4 first:pt-0 last:pb-0">
            <p className={cn("text-xs font-semibold uppercase tracking-wider text-muted-foreground", labelClassName)}>
                {label}
            </p>

            <AnimatePresence mode="wait" initial={false}>
                {!isEditing ? (
                    <motion.div
                        key="view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="mt-1 flex items-start justify-between gap-3"
                    >
                        <p className={cn("min-w-0 whitespace-pre-line break-words text-[15px] leading-relaxed", inputClassName)}>
                            {value || (
                                <span className="text-muted-foreground">
                                    {readOnly ? (emptyText ?? t('profile.editable.not_set')) : placeholder || t('profile.editable.not_set')}
                                </span>
                            )}
                        </p>
                        {!readOnly && <EditButton onClick={startEditing} label={t('profile.editable.edit', { field: label })} />}
                    </motion.div>
                ) : (
                    <motion.form
                        key="edit"
                        initial={{ opacity: 0, transform: 'translateY(4px)' }}
                        animate={{ opacity: 1, transform: 'translateY(0px)' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onSubmit={handleSubmit(onSave)}
                        className="mt-2"
                    >
                        <Controller
                            name={name}
                            control={control}
                            render={({ field }) => (
                                isTextarea ? (
                                    <Textarea
                                        {...field}
                                        value={field.value ?? ''}
                                        aria-label={label}
                                        className={cn("min-h-[100px] resize-none", inputClassName)}
                                        placeholder={placeholder}
                                        maxLength={maxLength}
                                        autoFocus
                                    />
                                ) : (
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        aria-label={label}
                                        className={inputClassName}
                                        placeholder={placeholder}
                                        maxLength={maxLength}
                                        autoFocus
                                    />
                                )
                            )}
                        />
                        <div className="flex items-start justify-between gap-3">
                            <EditActions saving={isSaving} onCancel={() => setIsEditing(false)} />
                            {maxLength && (
                                <span className="mt-4 text-xs tabular-nums text-muted-foreground">{draftLength}/{maxLength}</span>
                            )}
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
