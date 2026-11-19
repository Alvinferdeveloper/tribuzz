import { apiFetch, type Paginated } from '@/src/lib/api/client';

export interface Category {
    id: string;
    name: string;
    icon: string | null;
}

/** How many categories the pickers and the explore filter show. */
export const CATEGORIES_LIMIT = 10;

export async function fetchCategories(search?: string): Promise<Category[]> {
    const result = await apiFetch<Paginated<Category>>('/api/v1/categories', {
        query: { limit: CATEGORIES_LIMIT, q: search },
        fallbackError: 'CATEGORIES_LOAD_ERROR',
    });
    return result.data ?? [];
}
