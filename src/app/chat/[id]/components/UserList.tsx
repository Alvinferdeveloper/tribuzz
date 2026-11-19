'use client';

import { useMemo, useState } from 'react';
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Search, X, UserPlus, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";
import { tribeTone } from '@/src/app/utils/tribeColor';
import { ReportUserDialog } from './ReportUserDialog';

interface User {
    id: string;
    username: string;
    profileImage?: string;
}

interface UserListProps {
    users: User[];
    typingUsers: Set<string>;
    roomId?: string;
    /** The viewer's own username: shown first and marked as "you". */
    currentUsername?: string;
    /** Closes the panel (mobile overlay, or collapsing it on desktop). */
    onClose?: () => void;
}

const SEARCH_THRESHOLD = 7;

/**
 * "Your tribe" panel. You first, then whoever is typing, then everyone else;
 * each person wears their logo color around the avatar. Rows are single-line
 * unless there is something worth saying (typing, guest). Search appears when
 * the list gets long, and an invite button sits at the bottom.
 */
export function UserList({ users, typingUsers, roomId, currentUsername, onClose }: UserListProps) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [userToReport, setUserToReport] = useState<{ id: string, username: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const ordered = useMemo(() => {
        const rank = (u: User) => (u.username === currentUsername ? 0 : typingUsers.has(u.username) ? 1 : 2);
        const q = query.trim().toLowerCase();
        return users
            .filter((u) => !q || u.username.toLowerCase().includes(q))
            .sort((a, b) => rank(a) - rank(b));
    }, [users, typingUsers, currentUsername, query]);

    const handleReportClick = (e: React.MouseEvent, user: User) => {
        e.preventDefault();
        e.stopPropagation();
        setUserToReport({ id: user.id, username: user.username });
        setReportDialogOpen(true);
    };

    const handleInvite = async () => {
        if (!roomId) return;
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/chat/${roomId}`);
            setCopied(true);
            toast.success(t('chat.header.link_copied'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t('chat.header.link_copy_error'));
        }
    };

    return (
        <div className="flex h-full flex-col border-l border-border/60 bg-chat-chrome backdrop-blur-xl">
            {/* Same height as the chat header islands, so both edges line up. */}
            <div className="flex h-[68px] shrink-0 items-center justify-between gap-2 px-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                    {t('chat.user_list.title')}
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
                        {users.length}
                    </span>
                </h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        aria-label={t('chat.user_list.close')}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-90"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>

            {users.length >= SEARCH_THRESHOLD && (
                <label className="mx-3 mb-2 flex h-9 shrink-0 items-center gap-2 rounded-full bg-card px-3 ring-1 ring-border/60 focus-within:ring-2 focus-within:ring-primary/50">
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    <span className="sr-only">{t('chat.user_list.search')}</span>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('chat.user_list.search')}
                        className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </label>
            )}

            <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 scrollbar-thin-light">
                <AnimatePresence initial={false} mode="popLayout">
                    {ordered.map((user) => {
                        const isTyping = typingUsers.has(user.username);
                        const isAnonymous = user.id === user.username;
                        const isMe = user.username === currentUsername;
                        const tone = tribeTone(user.username);

                        const row = (
                            <motion.div
                                layout
                                initial={{ opacity: 0, transform: 'translateX(-8px)' }}
                                animate={{ opacity: 1, transform: 'translateX(0px)' }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                                className={cn(
                                    "group flex min-h-12 items-center gap-3 rounded-2xl px-2 py-1.5 transition-colors duration-150",
                                    !isAnonymous && !isMe && "cursor-pointer hover:bg-accent",
                                    isMe && "bg-primary/[0.07]",
                                    isTyping && "bg-tribe-teal/10"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <Avatar className={cn("size-9 ring-2 ring-offset-2 ring-offset-[var(--popover)]", tone.ring)}>
                                        <AvatarImage
                                            src={user.profileImage || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`}
                                            alt=""
                                        />
                                        <AvatarFallback className={tone.soft}>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-presence ring-2 ring-[var(--popover)]" aria-hidden="true" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="truncate text-sm font-semibold">{user.username}</span>
                                        {isMe && (
                                            <span className="shrink-0 rounded-full bg-primary/12 px-1.5 py-px text-[10px] font-bold text-primary">
                                                {t('chat.message.you')}
                                            </span>
                                        )}
                                    </div>
                                    {isTyping ? (
                                        <span className="flex items-center gap-1 text-xs font-medium text-tribe-teal-ink">
                                            {t('chat.user_list.typing')}
                                            <span className="flex gap-0.5" aria-hidden="true">
                                                <span className="size-1 rounded-full bg-current animate-typing-dot" />
                                                <span className="size-1 rounded-full bg-current animate-typing-dot [animation-delay:160ms]" />
                                                <span className="size-1 rounded-full bg-current animate-typing-dot [animation-delay:320ms]" />
                                            </span>
                                        </span>
                                    ) : isAnonymous ? (
                                        <span className="text-xs text-muted-foreground">{t('chat.user_list.guest')}</span>
                                    ) : null}
                                </div>

                                {!isAnonymous && !isMe && (
                                    <button
                                        aria-label={t('chat.user_list.report', { username: user.username })}
                                        onClick={(e) => handleReportClick(e, user)}
                                        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[opacity,background-color,color] duration-150 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                                    >
                                        <Flag className="size-4" />
                                    </button>
                                )}
                            </motion.div>
                        );

                        if (isAnonymous || isMe) {
                            return <div key={user.id}>{row}</div>;
                        }
                        return (
                            <Link key={user.id} href={`/profile/${encodeURIComponent(user.username)}`} className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                {row}
                            </Link>
                        );
                    })}
                </AnimatePresence>

                {ordered.length === 0 && query && (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t('chat.user_list.no_results')}</p>
                )}
            </div>

            {roomId && (
                <div className="shrink-0 border-t border-border/60 p-3">
                    <button
                        onClick={handleInvite}
                        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary/10 text-sm font-semibold text-primary transition-[background-color,transform] duration-150 ease-out hover:bg-primary/15 active:scale-[0.98]"
                    >
                        {copied ? <Check className="size-4" /> : <UserPlus className="size-4" />}
                        {t('chat.user_list.invite')}
                    </button>
                </div>
            )}

            <ReportUserDialog
                isOpen={reportDialogOpen}
                onClose={() => setReportDialogOpen(false)}
                reportedUsername={userToReport?.username || ''}
                reportedUserId={userToReport?.id || ''}
                roomId={roomId}
            />
        </div>
    );
}
