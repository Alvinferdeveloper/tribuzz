'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import Link from 'next/link';
import { Heart, LayoutGrid, Plus } from 'lucide-react';
import { useTranslation } from '@/src/app/lib/i18n';
import { useAuth } from '@/src/app/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { tribeTone } from '@/src/app/utils/tribeColor';
import { cn } from '@/src/lib/utils';

export type AuthFeature = 'create' | 'favorites' | 'my-rooms';

const FEATURE_ICON = { create: Plus, favorites: Heart, 'my-rooms': LayoutGrid } as const;
const FEATURE_KEY = { create: 'create', favorites: 'favorites', 'my-rooms': 'my_rooms' } as const;

type AuthPromptContextValue = {
    /**
     * For links to members-only pages: returns an onClick that, for a signed-out
     * visitor, stops the navigation and shows the invitation instead. Before,
     * the page loaded, rendered nothing and then bounced to /login: a visible
     * flash with no explanation of why.
     */
    guard: (feature: AuthFeature) => (e: React.MouseEvent) => void;
};

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

export function AuthPromptProvider({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation();
    const { session, isPending } = useAuth();
    const [feature, setFeature] = useState<AuthFeature | null>(null);

    const guard = useCallback((target: AuthFeature) => (e: React.MouseEvent) => {
        // While the session is still resolving, let the link work normally;
        // the page's own guard still protects it.
        if (isPending || session?.user) return;
        e.preventDefault();
        setFeature(target);
    }, [isPending, session?.user]);

    const Icon = feature ? FEATURE_ICON[feature] : Plus;
    const key = feature ? FEATURE_KEY[feature] : 'create';

    return (
        <AuthPromptContext.Provider value={{ guard }}>
            {children}
            <Dialog open={feature !== null} onOpenChange={(open) => !open && setFeature(null)}>
                <DialogContent className="sm:max-w-[400px] gap-0 overflow-hidden p-0">
                    {/* The four logo bubbles, small: a friendly "this is a community" cue. */}
                    <div className="relative flex h-28 items-center justify-center bg-primary/10">
                        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-60" aria-hidden="true">
                            {['Ana', 'Leo', 'Mia', 'Tom'].map((seed, i) => (
                                <span
                                    key={seed}
                                    className={cn(
                                        "size-9 rounded-2xl",
                                        tribeTone(seed).fill,
                                        i % 2 === 0 ? "rounded-bl-md -translate-y-2" : "rounded-br-md translate-y-2"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="relative flex size-14 items-center justify-center rounded-2xl bg-card text-primary ring-1 ring-border/60 shadow-[var(--menu-shadow)]">
                            <Icon className="size-6" />
                        </span>
                    </div>

                    <div className="flex flex-col gap-2 px-6 pt-5 pb-6 text-center">
                        <DialogTitle className="text-xl">{t(`auth_prompt.${key}.title`)}</DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed">
                            {t(`auth_prompt.${key}.description`)}
                        </DialogDescription>

                        <div className="mt-4 flex flex-col gap-2">
                            <Button asChild size="lg" className="w-full">
                                <Link href="/signup" onClick={() => setFeature(null)}>{t('auth_prompt.signup')}</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="w-full">
                                <Link href="/login" onClick={() => setFeature(null)}>{t('auth_prompt.login')}</Link>
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={() => setFeature(null)}>
                                {t('auth_prompt.dismiss')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AuthPromptContext.Provider>
    );
}

export function useAuthPrompt() {
    const ctx = useContext(AuthPromptContext);
    // Outside the provider (shouldn't happen): fall back to plain navigation.
    return ctx ?? { guard: () => () => {} };
}
