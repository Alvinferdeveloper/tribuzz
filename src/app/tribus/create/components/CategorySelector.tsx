'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Search } from 'lucide-react';
import { Category } from '../hooks/useCategories';
import { useCategorySearch } from '../hooks/useCategorySearch';
import { BubbleLoader } from "@/src/components/ui/bubble-loader";
import { cn } from '@/src/lib/utils';
import { TopicChip } from '@/src/app/tribus/components/TopicChip';

const MAX_CATEGORIES = 3;

interface CategorySelectorProps {
    categories: Category[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    loading?: boolean;
}

const chipBase = "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

export function CategorySelector({ categories, selectedIds, onChange, loading }: CategorySelectorProps) {
    const { t } = useTranslation();
    const [showSearch, setShowSearch] = useState(false);
    const { categories: searchResults, loading: searchLoading, search, setSearch } = useCategorySearch();

    // Search results can include categories the initial list didn't load.
    const known = [...categories, ...searchResults.filter(r => !categories.some(c => c.id === r.id))];
    const selectedCategories = selectedIds.map(id => known.find(c => c.id === id)).filter(Boolean) as Category[];

    const displayCategories = showSearch && search ? searchResults : categories;
    const availableCategories = displayCategories.filter(c => !selectedIds.includes(c.id));
    const full = selectedIds.length >= MAX_CATEGORIES;

    const closeSearch = () => {
        setShowSearch(false);
        setSearch('');
    };

    return (
        <fieldset className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
                <legend className="text-sm font-semibold">{t('rooms.create.categories.title')}</legend>
                <span className="text-xs tabular-nums text-muted-foreground">{selectedIds.length}/{MAX_CATEGORIES}</span>
            </div>

            {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(category => (
                        <TopicChip
                            key={category.id}
                            label={category.name}
                            icon={category.icon}
                            active
                            onClick={() => onChange(selectedIds.filter(id => id !== category.id))}
                            ariaLabel={t('rooms.create.categories.remove', { name: category.name })}
                            trailing={<X className="-mr-1 size-3.5 opacity-70" />}
                        />
                    ))}
                </div>
            )}

            {full ? (
                <p className="text-xs text-muted-foreground">{t('rooms.create.categories.max_selected')}</p>
            ) : (
                <div className="space-y-3">
                    {showSearch && (
                        <label className="group flex h-10 items-center gap-2 rounded-xl bg-[var(--field-bg)] px-3 ring-1 ring-input focus-within:ring-2 focus-within:ring-primary/60">
                            <Search className="size-4 shrink-0 text-muted-foreground group-focus-within:text-primary" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('rooms.create.categories.search_placeholder')}
                                className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
                                autoFocus
                            />
                            <button type="button" onClick={closeSearch} aria-label={t('rooms.create.categories.close_search')} className="flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
                                <X className="size-4" />
                            </button>
                        </label>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {(showSearch && searchLoading) || loading ? (
                            <BubbleLoader size="sm" label={t('rooms.create.categories.loading')} />
                        ) : availableCategories.length === 0 ? (
                            <span className="text-sm text-muted-foreground">
                                {showSearch && search ? t('rooms.create.categories.not_found') : t('rooms.create.categories.no_more')}
                            </span>
                        ) : (
                            availableCategories.map(category => (
                                <TopicChip
                                    key={category.id}
                                    label={category.name}
                                    icon={category.icon}
                                    onClick={() => onChange([...selectedIds, category.id])}
                                    trailing={<Plus className="-mr-1 size-3.5 opacity-60" />}
                                />
                            ))
                        )}

                        {!showSearch && categories.length > 3 && (
                            <button
                                type="button"
                                onClick={() => { setShowSearch(true); setSearch(''); }}
                                className={cn(chipBase, "border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary/60 hover:text-primary")}
                            >
                                <Search className="size-3.5" />
                                {t('rooms.create.categories.search_more')}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </fieldset>
    );
}
