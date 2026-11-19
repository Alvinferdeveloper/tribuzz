'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tooltip } from 'radix-ui';
import { useTheme } from 'next-themes';
import { Compass, LayoutGrid, Plus, Heart, Moon, Sun } from 'lucide-react';
import { useTranslation } from '@/src/app/lib/i18n';
import { useAuth } from '@/src/app/hooks/useAuth';
import useRoom from '@/src/app/tribus/hooks/useRoom';
import { useRoomUserCounts } from '@/src/app/tribus/hooks/useRoomUserCounts';
import { UserNav } from '@/src/app/components/layout/ProfileDropDown';
import { tribeTone } from '@/src/app/utils/tribeColor';
import { cn } from '@/src/lib/utils';
import { useAuthPrompt } from '@/src/app/components/auth/AuthPrompt';
import { onFavoriteChange } from '@/src/app/tribus/utils/favoriteEvents';
import type { Room } from '@/src/app/tribus/hooks/useRoom';

/**
 * Desktop navigation for the tribes surface. Its visual language comes from
 * the Tribuzz logo: every tile is a speech bubble with one pointed corner,
 * tribes wear their logo color (tail on the same corner as in the logo), and
 * on hover a bubble puffs up and leans toward the content. The current place
 * is shown with a filled tile and a ring, and the main destinations carry a
 * visible label instead of relying on icons alone.
 */

// Shared bubble motion: puffs up and leans right, toward the page content.
const BUBBLE_MOTION =
    "transition-[transform,background-color,color,box-shadow] duration-200 ease-out group-hover:scale-[1.06] group-hover:rotate-[4deg] motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100";
const BUBBLE_FOCUS = "group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-rail";

export function TribeRail() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const { session } = useAuth();
    const isLoggedIn = Boolean(session?.user);
    const { guard } = useAuthPrompt();

    return (
        <Tooltip.Provider delayDuration={250} skipDelayDuration={400}>
            <nav
                aria-label={t('layout.rail.label')}
                className="fixed inset-y-0 left-0 z-40 hidden w-[80px] flex-col items-center gap-3 border-r border-border/60 bg-rail py-4 md:flex"
            >
                <RailItem href="/" label={t('layout.rail.home')}>
                    <Image
                        src="/images/logo_chat.png"
                        width={36}
                        height={36}
                        alt=""
                        className={cn("size-9 rounded-xl", BUBBLE_MOTION, BUBBLE_FOCUS)}
                    />
                </RailItem>

                <RailDivider />

                <RailItem href="/tribus" label={t('layout.header.nav_explore')} caption active={pathname === '/tribus'}>
                    <IconBubble active={pathname === '/tribus'}><Compass className="size-5" /></IconBubble>
                </RailItem>

                {isLoggedIn && (
                    <RailItem href="/tribus/my-rooms" label={t('layout.profile_dropdown.my_rooms')} caption active={pathname === '/tribus/my-rooms'}>
                        <IconBubble active={pathname === '/tribus/my-rooms'}><LayoutGrid className="size-5" /></IconBubble>
                    </RailItem>
                )}

                {isLoggedIn && <FavoriteTribes pathname={pathname} />}

                <RailItem
                    href="/tribus/create"
                    label={t('layout.profile_dropdown.create_room')}
                    caption
                    active={pathname === '/tribus/create'}
                    onClick={guard('create')}
                >
                    <span
                        className={cn(
                            "flex size-12 items-center justify-center rounded-[18px] rounded-bl-[5px] border-2 border-dashed border-primary/45 text-primary",
                            BUBBLE_MOTION, BUBBLE_FOCUS,
                            "group-hover:border-transparent group-hover:bg-primary group-hover:text-primary-foreground",
                            pathname === '/tribus/create' && "border-transparent bg-primary text-primary-foreground ring-2 ring-primary/35 ring-offset-2 ring-offset-rail"
                        )}
                    >
                        <Plus className="size-5 transition-transform duration-200 ease-out group-hover:rotate-90" />
                    </span>
                </RailItem>

                <div className="mt-auto flex flex-col items-center gap-3">
                    <RailThemeButton />
                    <UserNav compact menuSide="right" menuAlign="end" />
                </div>
            </nav>
        </Tooltip.Provider>
    );
}

function FavoriteTribes({ pathname }: { pathname: string }) {
    const { t } = useTranslation();
    const { rooms: fetched } = useRoom('', 'favorites');
    const { userCounts } = useRoomUserCounts();
    // Local corrections on top of the fetched page, fed by favorite toggles
    // anywhere on the page, so the rail updates the moment a heart is tapped.
    const [added, setAdded] = useState<Room[]>([]);
    const [removed, setRemoved] = useState<Set<string>>(() => new Set());

    useEffect(() => onFavoriteChange(({ roomId, isFavorite, room }) => {
        setRemoved((prev) => {
            const next = new Set(prev);
            if (isFavorite) next.delete(roomId); else next.add(roomId);
            return next;
        });
        setAdded((prev) => {
            const without = prev.filter((r) => r.id !== roomId);
            return isFavorite && room ? [room, ...without] : without;
        });
    }), []);

    const rooms = [
        ...added.filter((a) => !fetched.some((r) => r.id === a.id)),
        ...fetched,
    ].filter((r) => !removed.has(r.id));

    return (
        <>
            <RailItem href="/tribus/favorites" label={t('layout.profile_dropdown.favorites')} caption active={pathname === '/tribus/favorites'}>
                <IconBubble active={pathname === '/tribus/favorites'}><Heart className="size-5" /></IconBubble>
            </RailItem>

            {rooms.length > 0 && <RailDivider />}

            {/* Scrolls on its own when there are many favorites; tooltips are
                portaled, so the scroll container never clips them. The padding
                leaves room for the hover lean and the focus ring. */}
            <ul className="flex min-h-0 w-full flex-col items-center gap-2.5 overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {rooms.map((room) => {
                    const online = userCounts[room.id] || 0;
                    return (
                        <li key={room.id} className="w-full animate-in fade-in zoom-in-90 duration-200">
                            <RailItem
                                href={`/chat/${room.id}`}
                                label={room.name}
                                hint={online > 0 ? t('layout.rail.online', { count: online }) : undefined}
                            >
                                <TribeBubble name={room.name} icon={room.server_icon} online={online} />
                            </RailItem>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

function TribeBubble({ name, icon, online }: { name: string; icon?: string; online: number }) {
    const [failed, setFailed] = useState(false);
    const tone = tribeTone(name);
    return (
        <span className="relative block">
            <span className={cn(
                "flex size-12 items-center justify-center overflow-hidden rounded-[18px]",
                tone.fill, tone.tail, BUBBLE_MOTION, BUBBLE_FOCUS,
                // Hover: a ring in the tribe's own color.
                "ring-offset-2 ring-offset-rail group-hover:ring-2", tone.hoverRing
            )}>
                {icon && !failed ? (
                    <img src={icon} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
                ) : (
                    <span className="select-none text-base font-bold text-[oklch(0.2_0.04_265)]">{name.charAt(0).toUpperCase()}</span>
                )}
            </span>
            {online > 0 && (
                <span aria-hidden="true" className={cn("absolute size-3.5 rounded-full bg-presence ring-[3px] ring-rail", tone.dot)} />
            )}
        </span>
    );
}

function IconBubble({ active, children }: { active?: boolean; children: React.ReactNode }) {
    return (
        <span
            className={cn(
                "flex size-12 items-center justify-center rounded-[18px] rounded-bl-[5px]",
                BUBBLE_MOTION, BUBBLE_FOCUS,
                active
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/35 ring-offset-2 ring-offset-rail"
                    : "bg-card text-muted-foreground ring-1 ring-border/60 group-hover:bg-primary/12 group-hover:text-primary group-hover:ring-primary/25"
            )}
        >
            {children}
        </span>
    );
}

function RailItem({ href, label, hint, caption = false, active = false, onClick, children }: {
    href: string;
    label: string;
    hint?: string;
    /** Show the label under the bubble (main destinations); tribes use the tooltip only. */
    caption?: boolean;
    active?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    children: React.ReactNode;
}) {
    // Full rail width: easy target, and room for the hover lean and focus ring.
    const link = (
        <Link
            href={href}
            aria-label={caption ? undefined : label}
            aria-current={active ? 'page' : undefined}
            onClick={onClick}
            className="group flex w-full flex-col items-center gap-1 outline-none transition-transform duration-150 ease-out active:scale-[0.95]"
        >
            {children}
            {caption && (
                <span className={cn(
                    "max-w-[72px] truncate text-[10px] font-semibold leading-tight transition-colors duration-150",
                    active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                    {label}
                </span>
            )}
        </Link>
    );

    // Captioned items already say what they are; only icon-only ones need a tooltip.
    if (caption) return link;

    return (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content
                    side="right"
                    sideOffset={6}
                    className="z-50 origin-(--radix-tooltip-content-transform-origin) rounded-xl rounded-bl-[4px] bg-popover px-3 py-1.5 text-sm font-semibold text-popover-foreground shadow-[var(--menu-shadow)] ring-1 ring-border/70 animate-in fade-in zoom-in-95 slide-in-from-left-1 duration-150"
                >
                    {label}
                    {hint && <span className="ml-2 text-xs font-medium text-presence">{hint}</span>}
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
}

function RailDivider() {
    return <span aria-hidden="true" className="h-0.5 w-7 shrink-0 rounded-full bg-border" />;
}

function RailThemeButton() {
    const { t } = useTranslation();
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const isDark = mounted && resolvedTheme === 'dark';

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={t('layout.theme.aria_label')}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            {mounted && (isDark ? <Sun className="size-5" /> : <Moon className="size-5" />)}
        </button>
    );
}
