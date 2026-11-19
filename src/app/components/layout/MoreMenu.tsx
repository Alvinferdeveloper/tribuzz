'use client';

import Link from 'next/link';
import { Ellipsis, HelpCircle, Users, Shield, FileText, Cookie } from 'lucide-react';
import { useTranslation } from '@/src/app/lib/i18n';
import { APP_NAME } from '@/src/app/constants';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { cn } from '@/src/lib/utils';

const HELP_LINKS = [
    { href: '/faq', key: 'layout.footer.faq', icon: HelpCircle },
    { href: '/guia-comunidad', key: 'layout.footer.community_guidelines', icon: Users },
] as const;

const LEGAL_LINKS = [
    { href: '/legal/privacidad', key: 'layout.footer.privacy', icon: Shield },
    { href: '/legal/terminos', key: 'layout.footer.terms', icon: FileText },
    { href: '/legal/cookies', key: 'layout.footer.cookies', icon: Cookie },
] as const;

/**
 * "More" menu for the app surfaces (tribus pages), which have no footer: the
 * help and legal links a footer would carry, one tap away. The rail opens it
 * to the side on desktop; the mobile top bar opens it downward.
 */
export function MoreMenu({ side = 'right', align = 'end', className }: {
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
}) {
    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    aria-label={t('layout.rail.more')}
                    className={cn(
                        'flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=open]:bg-accent data-[state=open]:text-foreground',
                        className
                    )}
                >
                    <Ellipsis className="size-5" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side={side} align={align} sideOffset={10} className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">{t('layout.footer.platform_heading')}</DropdownMenuLabel>
                {HELP_LINKS.map(({ href, key, icon: Icon }) => (
                    <DropdownMenuItem key={href} asChild className="cursor-pointer">
                        <Link href={href}>
                            <Icon className="size-4" />
                            {t(key)}
                        </Link>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">{t('layout.footer.legal_heading')}</DropdownMenuLabel>
                {LEGAL_LINKS.map(({ href, key, icon: Icon }) => (
                    <DropdownMenuItem key={href} asChild className="cursor-pointer">
                        <Link href={href}>
                            <Icon className="size-4" />
                            {t(key)}
                        </Link>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
                    © {new Date().getFullYear()} {APP_NAME}
                </p>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
