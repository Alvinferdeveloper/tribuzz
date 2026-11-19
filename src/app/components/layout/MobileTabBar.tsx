'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Heart, Plus, LayoutGrid, CircleUser } from 'lucide-react';
import { useTranslation } from '@/src/app/lib/i18n';
import { useAuth } from '@/src/app/hooks/useAuth';
import { cn } from '@/src/lib/utils';
import { useAuthPrompt, type AuthFeature } from '@/src/app/components/auth/AuthPrompt';

/**
 * Mobile navigation for the tribes surface: a bottom tab bar within thumb
 * reach (the usual pattern on phones), with "create tribe" as the raised
 * center action since it is the platform's most valuable action.
 */
export function MobileTabBar() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const { session } = useAuth();
    const { guard } = useAuthPrompt();

    const tabs = [
        { href: '/tribus', label: t('layout.header.nav_explore'), icon: Compass },
        { href: '/tribus/favorites', label: t('layout.profile_dropdown.favorites'), icon: Heart, feature: 'favorites' as AuthFeature },
        { href: '/tribus/create', label: t('layout.profile_dropdown.create_room'), icon: Plus, primary: true, feature: 'create' as AuthFeature },
        { href: '/tribus/my-rooms', label: t('layout.profile_dropdown.my_rooms'), icon: LayoutGrid, feature: 'my-rooms' as AuthFeature },
        session?.user
            ? { href: '/profile', label: t('layout.profile_dropdown.profile'), icon: CircleUser }
            : { href: '/login', label: t('layout.profile_dropdown.login_title'), icon: CircleUser },
    ] as { href: string; label: string; icon: typeof Compass; primary?: boolean; feature?: AuthFeature }[];

    return (
        <nav
            aria-label={t('layout.rail.label')}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-chat-chrome pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl backdrop-saturate-150 md:hidden"
        >
            <ul className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2">
                {tabs.map(({ href, label, icon: Icon, primary, feature }) => {
                    const onClick = feature ? guard(feature) : undefined;
                    const active = pathname === href;
                    if (primary) {
                        return (
                            <li key={href} className="flex justify-center">
                                <Link
                                    href={href}
                                    aria-label={label}
                                    aria-current={active ? 'page' : undefined}
                                    onClick={onClick}
                                    className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--btn-primary-shadow)] transition-transform duration-150 ease-out active:scale-90"
                                >
                                    <Icon className="size-6" />
                                </Link>
                            </li>
                        );
                    }
                    return (
                        <li key={href}>
                            <Link
                                href={href}
                                aria-current={active ? 'page' : undefined}
                                onClick={onClick}
                                className={cn(
                                    "flex flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-[color,transform] duration-150 ease-out active:scale-95",
                                    active ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <Icon className={cn("size-[22px]", active && href === '/tribus/favorites' && "fill-current")} />
                                <span className="max-w-full truncate">{label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
