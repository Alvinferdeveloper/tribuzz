'use client';

import { useTranslation } from 'react-i18next';
import { ConnectingAnimation } from '@/src/app/components/animations/ConnectionAnimation';
import { BadgeCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface RoomCardContentProps {
    name: string;
    description: string;
    verified: boolean;
    userCount: number;
    isConnecting: boolean;
    categories?: { id: string; name: string; icon: string | null }[];
    footer?: React.ReactNode;
}

export function RoomCardContent({ name, description, verified, userCount, isConnecting, categories, footer }: RoomCardContentProps) {
    const { t } = useTranslation();
    const isLive = userCount > 0;
    const firstCategory = categories?.[0];

    return (
        <div className="flex flex-1 flex-col px-4 pt-8 pb-4">
            <div className="flex items-center gap-1.5">
                <h3 className="truncate text-[15px] font-semibold leading-tight tracking-tight">
                    {name}
                </h3>
                {verified && (
                    <BadgeCheck className="size-4 shrink-0 text-tribe-teal-ink" aria-label={t('rooms.card.verified')} />
                )}
            </div>

            <div className="mt-1.5 mb-4 flex-1">
                {isConnecting ? (
                    <div className="py-2">
                        <ConnectingAnimation text={t('rooms.card.connecting')} />
                    </div>
                ) : (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            <div className="mt-auto flex items-center gap-2 text-xs">
                <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-semibold tabular-nums",
                    isLive ? "bg-presence/12 text-foreground" : "bg-muted text-muted-foreground"
                )}>
                    <span aria-hidden="true" className={cn("size-1.5 rounded-full", isLive ? "bg-presence" : "bg-muted-foreground/50")} />
                    {t('rooms.card.active_users', { count: userCount || 0 })}
                </span>

                {firstCategory && (
                    <span className="truncate text-muted-foreground">
                        {firstCategory.icon && <span aria-hidden="true" className="mr-1">{firstCategory.icon}</span>}
                        {firstCategory.name}
                    </span>
                )}

                <ArrowRight
                    aria-hidden="true"
                    className="ml-auto size-4 shrink-0 text-primary opacity-0 -translate-x-1 transition-[opacity,transform] duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0"
                />
            </div>

            {footer && (
                <div className="mt-3 border-t border-border pt-3" onClick={(e) => e.stopPropagation()}>
                    {footer}
                </div>
            )}
        </div>
    );
}
