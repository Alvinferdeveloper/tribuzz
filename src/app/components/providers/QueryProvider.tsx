'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from '@/src/lib/query/queryClient';

/**
 * One QueryClient per browser session. Created in state (not at module
 * level) so server renders never share a cache between requests.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(makeQueryClient);
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
