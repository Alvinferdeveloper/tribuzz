"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { RoomInfo } from "@/src/app/chat/[id]/hooks/useRoomInfo";
import { tribeTone } from "@/src/app/utils/tribeColor";
import { cn } from "@/src/lib/utils";

interface ChatWelcomeProps {
    room: RoomInfo;
    users: { id: string; username: string; profileImage?: string }[];
    /** No messages yet: add a nudge to start the conversation. */
    isEmpty: boolean;
}

/**
 * Opening card of every conversation: who this tribe is and who is here right
 * now. Scrolls away with the history like the first message would, and
 * replaces the old "no messages" empty state.
 */
export function ChatWelcome({ room, users, isEmpty }: ChatWelcomeProps) {
    const { t } = useTranslation();
    const tone = tribeTone(room.name);
    const [bannerFailed, setBannerFailed] = useState(false);
    const [iconFailed, setIconFailed] = useState(false);
    const shown = users.slice(0, 5);

    return (
        <section className="mx-auto mt-2 mb-8 w-full max-w-md overflow-hidden rounded-[10px] bg-card/90 ring-1 ring-border/60 shadow-[0_2px_6px_var(--shadow-tint),0_24px_48px_-28px_var(--shadow-tint)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className={cn("relative h-24 w-full overflow-hidden", tone.fill)}>
                {room.server_banner && !bannerFailed ? (
                    <img src={room.server_banner} alt="" className="h-full w-full object-cover" onError={() => setBannerFailed(true)} />
                ) : (
                    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 320 96" preserveAspectRatio="xMidYMid slice">
                        <path d="M228 10c26 0 47 19 47 43 0 9-3 17-8 24l12 21-25-10c-8 5-17 8-26 8-26 0-47-19-47-43s21-43 47-43z" fill="white" opacity="0.22" />
                        <path d="M60 30c18 0 33 13 33 30s-15 30-33 30c-6 0-12-2-17-4l-18 7 8-15c-4-5-6-11-6-18 0-17 15-30 33-30z" fill="white" opacity="0.14" />
                    </svg>
                )}
            </div>

            <div className="px-5 pb-5">
                {/* relative + z-10: the banner above is positioned, so without this
                    it paints over the overlapping half of the icon. */}
                <div className={cn("relative z-10 -mt-7 mb-3 flex size-14 items-center justify-center overflow-hidden rounded-[20px] ring-4 ring-card", tone.fill, tone.tail)}>
                    {room.server_icon && !iconFailed ? (
                        <img src={room.server_icon} alt="" className="h-full w-full object-cover" onError={() => setIconFailed(true)} />
                    ) : (
                        <span className="select-none text-xl font-bold text-[oklch(0.2_0.04_265)]">{room.name.charAt(0).toUpperCase()}</span>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-lg font-semibold tracking-tight">{room.name}</h2>
                    {room.verified && <BadgeCheck className="size-4 shrink-0 text-tribe-teal-ink" aria-label={t('rooms.card.verified')} />}
                </div>
                {room.full_description && (
                    <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{room.full_description}</p>
                )}

                {users.length > 0 && (
                    <div className="mt-4 flex items-center gap-2.5">
                        <div className="flex -space-x-2">
                            {shown.map((u) => (
                                <Avatar key={u.id} className="size-7 ring-2 ring-card">
                                    <AvatarImage src={u.profileImage || `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.username}`} alt="" />
                                    <AvatarFallback className={cn("text-[10px]", tribeTone(u.username).soft)}>{u.username.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <span className="size-1.5 rounded-full bg-presence" aria-hidden="true" />
                            {t('layout.rail.online', { count: users.length })}
                        </span>
                    </div>
                )}

                {isEmpty && (
                    <p className="mt-4 rounded-2xl rounded-bl-md bg-primary/10 px-3.5 py-2.5 text-sm font-medium text-foreground">
                        {t('chat.empty_state.subtitle')}
                    </p>
                )}
            </div>
        </section>
    );
}
