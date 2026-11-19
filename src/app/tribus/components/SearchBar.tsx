'use client';

import { Search, X } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/src/lib/utils';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

/** Compact version of the explore hero's search field: a solid card pill. */
export function SearchBar({ value, onChange, placeholder, className }: SearchBarProps) {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <label
            className={cn(
                'group flex h-12 w-full max-w-xl items-center gap-3 rounded-2xl bg-card px-4 text-card-foreground',
                'shadow-[0_8px_24px_-14px_var(--shadow-tint)] ring-1 ring-border transition-shadow duration-200',
                'focus-within:ring-2 focus-within:ring-primary/60',
                className
            )}
        >
            <Search className="size-[18px] shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <span className="sr-only">{placeholder ?? t('rooms.search.placeholder')}</span>
            <input
                ref={inputRef}
                type="search"
                className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
                placeholder={placeholder ?? t('rooms.search.placeholder')}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => { onChange(''); inputRef.current?.focus(); }}
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-150 hover:bg-accent hover:text-foreground active:scale-95"
                    aria-label={t('rooms.search.clear')}
                >
                    <X className="size-4" />
                </button>
            )}
        </label>
    );
}
