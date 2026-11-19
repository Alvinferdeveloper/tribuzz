"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, Check, Moon, Sun, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { RoomInfoDialog } from "@/src/app/chat/[id]/components/RoomInfoDialog";
import { RoomInfo } from "@/src/app/chat/[id]/hooks/useRoomInfo";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import { tribeTone } from "@/src/app/utils/tribeColor";

interface User {
    id: string;
    username: string;
    profileImage?: string;
}

interface ChatHeaderProps {
    roomId: string;
    roomName?: string;
    room: RoomInfo | null;
    isUserListVisible: boolean;
    onToggleUserList: () => void;
    usersInRoom?: User[];
    typingUsers?: Set<string>;
}

// Floating "island": the header itself is transparent over the scene; only
// these two groups get a glass surface, so the sky stays visible between them.
const ISLAND = "pointer-events-auto flex items-center rounded-full bg-chat-chrome p-1 ring-1 ring-border/60 shadow-[var(--menu-shadow)] backdrop-blur-xl backdrop-saturate-150";
const ICON_BTN = "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-[0.92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

function RoomBubble({ name, icon }: { name: string; icon?: string }) {
    const [failed, setFailed] = useState(false);
    const tone = tribeTone(name);
    return (
        <span className={cn("flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[14px]", tone.fill, tone.tail)}>
            {icon && !failed ? (
                <img src={icon} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
            ) : (
                <span className="select-none text-sm font-bold text-[oklch(0.2_0.04_265)]">{(name || "?").charAt(0).toUpperCase()}</span>
            )}
        </span>
    );
}

export function ChatHeader({ roomId, roomName, room, isUserListVisible, onToggleUserList, usersInRoom = [], typingUsers }: ChatHeaderProps) {
    const { t } = useTranslation();
    const [justCopied, setJustCopied] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);

    const typing = Array.from(typingUsers ?? []);
    const typingText = typing.length === 0
        ? null
        : typing.length === 1
            ? t('chat.typing.single', { username: typing[0] })
            : typing.length === 2
                ? t('chat.typing.double', { user1: typing[0], user2: typing[1] })
                : t('chat.typing.multiple');

    const handleShare = async () => {
        const url = `${window.location.origin}/chat/${roomId}`;
        try {
            await navigator.clipboard.writeText(url);
            setJustCopied(true);
            toast.success(t('chat.header.link_copied'));
            setTimeout(() => setJustCopied(false), 2000);
        } catch {
            toast.error(t('chat.header.link_copy_error'));
        }
    };

    const name = roomName || t('chat.header.room_fallback');

    return (
        <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 pt-3 sm:px-4">
            <h1 className="sr-only">{name}</h1>
            {/* Who and where: the tribe, who's here and what's happening right now. */}
            <div className={cn(ISLAND, "min-w-0 gap-0.5 pr-1")}>
                <Link href="/tribus" className={cn(ICON_BTN, "md:hidden")} aria-label={t('chat.header.back')}>
                    <ArrowLeft className="size-4" />
                </Link>

                <button
                    onClick={() => room && setInfoOpen(true)}
                    disabled={!room}
                    aria-label={t('chat.header.room_info')}
                    className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-full py-0.5 pl-0.5 pr-3 text-left transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.98] disabled:cursor-default disabled:hover:bg-transparent disabled:active:scale-100"
                >
                    <RoomBubble name={name} icon={room?.server_icon} />
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold leading-tight tracking-tight">{name}</span>
                        <span className="block truncate text-[11px] leading-tight text-muted-foreground" aria-live="polite">
                            {typingText ? (
                                <span className="font-medium text-primary">{typingText}</span>
                            ) : (
                                <>
                                    <span className="mr-1 inline-block size-1.5 -translate-y-px rounded-full bg-presence align-middle" aria-hidden="true" />
                                    {t('layout.rail.online', { count: usersInRoom.length })}
                                    {room?.short_description && <span className="hidden sm:inline"> · {room.short_description}</span>}
                                </>
                            )}
                        </span>
                    </span>
                </button>
            </div>

            {/* Actions: people (opens the list), invite, theme on mobile. */}
            <div className={cn(ISLAND, "shrink-0 gap-0.5")}>
                <button
                    onClick={onToggleUserList}
                    aria-label={t('chat.header.show_participants')}
                    aria-pressed={isUserListVisible}
                    className={cn(
                        "flex h-9 cursor-pointer items-center gap-1.5 rounded-full pl-1.5 pr-2.5 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isUserListVisible ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                >
                    <span className="hidden -space-x-2 sm:flex">
                        {usersInRoom.slice(0, 3).map((u) => (
                            <Avatar key={u.id} className="size-6 ring-2 ring-[var(--popover)]">
                                <AvatarImage src={u.profileImage || `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.username}`} alt="" />
                                <AvatarFallback className={cn("text-[9px]", tribeTone(u.username).soft)}>{u.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        ))}
                    </span>
                    <Users className="size-4 sm:hidden" />
                    <span className="text-xs font-semibold tabular-nums">{usersInRoom.length}</span>
                </button>

                <button onClick={handleShare} aria-label={t('chat.header.share')} className={ICON_BTN}>
                    {justCopied ? <Check className="size-4 text-presence" /> : <Share2 className="size-4" />}
                </button>

                <ThemeIconButton className="md:hidden" />
            </div>

            {room && (
                <RoomInfoDialog
                    room={room}
                    memberCount={usersInRoom.length}
                    open={infoOpen}
                    onOpenChange={setInfoOpen}
                />
            )}
        </header>
    );
}

function ThemeIconButton({ className }: { className?: string }) {
    const { t } = useTranslation();
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const isDark = mounted && resolvedTheme === "dark";
    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={t('layout.theme.aria_label')}
            className={cn(ICON_BTN, className)}
        >
            {mounted && (isDark ? <Sun className="size-4" /> : <Moon className="size-4" />)}
        </button>
    );
}
