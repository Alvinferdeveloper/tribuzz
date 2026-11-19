'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldValues, Path } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/src/components/ui/button';
import { BubbleLoader } from "@/src/components/ui/bubble-loader";
import { EditButton } from './EditableField';
import { cn } from '@/src/lib/utils';

interface Option {
    value: string;
    label: string;
}

interface EditableSelectFieldProps<T extends FieldValues, Name extends Path<T> = Path<T>> {
    name: Name;
    label: string;
    value: string | undefined;
    updateFn: (field: Name, value: any) => Promise<void>;
    options: Option[];
    placeholder?: string;
    readOnly?: boolean;
}

/**
 * A short list of choices shown as pills: picking one saves it right away,
 * so there's no dropdown to open and no separate save step.
 */
export function EditableSelectField<T extends FieldValues, Name extends Path<T> = Path<T>>({
    name,
    label,
    value,
    updateFn,
    options,
    placeholder = '',
    readOnly = false,
}: EditableSelectFieldProps<T, Name>) {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [savingValue, setSavingValue] = useState<string | null>(null);

    const choose = async (next: string) => {
        if (next === value) {
            setIsEditing(false);
            return;
        }
        setSavingValue(next);
        await updateFn(name, next);
        setSavingValue(null);
        setIsEditing(false);
    };

    const displayValue = options.find(option => option.value === value)?.label;

    return (
        <div className="group py-4 first:pt-0 last:pb-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>

            <AnimatePresence mode="wait" initial={false}>
                {!isEditing ? (
                    <motion.div
                        key="view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="mt-1 flex items-center justify-between gap-3"
                    >
                        <p className="text-[15px]">
                            {displayValue || <span className="text-muted-foreground">{readOnly ? t('profile.editable.not_set') : placeholder}</span>}
                        </p>
                        {!readOnly && <EditButton onClick={() => setIsEditing(true)} label={t('profile.editable.edit', { field: label })} />}
                    </motion.div>
                ) : (
                    <motion.div
                        key="edit"
                        initial={{ opacity: 0, transform: 'translateY(4px)' }}
                        animate={{ opacity: 1, transform: 'translateY(0px)' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="mt-2.5"
                    >
                        <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
                            {options.map(option => {
                                const selected = option.value === value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={selected}
                                        disabled={savingValue !== null}
                                        onClick={() => choose(option.value)}
                                        className={cn(
                                            "inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 text-sm font-semibold",
                                            "transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] disabled:cursor-default",
                                            selected
                                                ? "bg-foreground text-background"
                                                : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground hover:ring-muted-foreground/40"
                                        )}
                                    >
                                        {savingValue === option.value && <BubbleLoader size="sm" mono />}
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                        <Button type="button" size="sm" variant="ghost" className="mt-2 -ml-2" onClick={() => setIsEditing(false)}>
                            {t('profile.editable.cancel')}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
