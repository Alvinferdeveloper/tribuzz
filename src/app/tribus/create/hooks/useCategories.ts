'use client';

import { useQuery } from '@tanstack/react-query';
import { errorCode } from '@/src/lib/api/client';
import { fetchCategories } from '@/src/app/tribus/api/categories';
import { categoryKeys } from '@/src/app/tribus/api/queryKeys';

// Domain type lives with the API module; re-exported for existing imports.
export type { Category } from '@/src/app/tribus/api/categories';

/** Categories rarely change: one fetch serves every screen for a while. */
const CATEGORIES_STALE_MS = 10 * 60_000;

/**
 * Tribe categories for the explore filter and the category pickers. Shared
 * cache: the filter, create, edit and admin dialogs all read the same list.
 */
export function useCategories() {
    const query = useQuery({
        queryKey: categoryKeys.list(),
        queryFn: () => fetchCategories(),
        staleTime: CATEGORIES_STALE_MS,
    });

    return {
        categories: query.data ?? [],
        loading: query.isPending,
        error: query.error ? errorCode(query.error, 'CATEGORIES_LOAD_ERROR') : null,
        refetch: query.refetch,
    };
}
