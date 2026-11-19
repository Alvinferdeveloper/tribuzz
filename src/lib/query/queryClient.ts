import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/src/lib/api/client';

/**
 * App-wide defaults for server state. Individual queries override what
 * they need (e.g. near-static data gets a longer staleTime).
 */
export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Fresh for a minute: moving between screens reuses the cache
                // instead of refetching (and flashing skeletons).
                staleTime: 60_000,
                // Kept for 10 minutes after the last screen using it unmounts.
                gcTime: 10 * 60_000,
                // Data refreshes when you come back to a screen or reconnect;
                // not on every tab switch.
                refetchOnWindowFocus: false,
                // Retry network hiccups and server errors once; a 4xx (bad input,
                // not signed in, rate limited) won't fix itself on retry.
                retry: (failureCount, error) => {
                    if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
                    return failureCount < 1;
                },
            },
        },
    });
}
