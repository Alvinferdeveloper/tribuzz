'use client';

import { createContext, useContext, useMemo, useRef } from 'react';
import { authClient } from '@/src/app/lib/auth-client';

type Session = ReturnType<typeof authClient.useSession>['data'];

type SessionContextType = {
    session: Session;
    /** True only until the session is known for the first time: gate loaders on this. */
    isPending: boolean;
    /** True while any session check is in flight (incl. background re-checks):
     *  redirects wait for this, so they never act on a half-updated session. */
    isChecking: boolean;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const { data: session, isPending: queryPending } = authClient.useSession();

    // better-auth re-checks the session whenever the tab regains focus, and
    // while signed out it flags that background re-check as pending again.
    // Guards treat "pending" as "show a loader", so returning to the login
    // tab swapped the form for a loader and remounted it, losing what was
    // typed. Only the very first check is pending for the app; re-checks run
    // in the background with the last known session.
    const resolvedOnce = useRef(false);
    if (!queryPending) resolvedOnce.current = true;
    const isPending = queryPending && !resolvedOnce.current;

    // Memoize context value to avoid re-rendering all consumers
    // when better-auth returns a new session object with the same data
    const value = useMemo(() => ({ session, isPending, isChecking: queryPending }), [
        session?.user?.id,
        session?.user?.name,
        session?.user?.email,
        session?.user?.image,
        isPending,
        queryPending,
    ]);

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error('useSession must be used within a <SessionProvider>');
    return ctx;
}
