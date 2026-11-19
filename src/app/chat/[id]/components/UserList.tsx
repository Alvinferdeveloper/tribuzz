'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { motion, AnimatePresence } from 'framer-motion';
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { Flag } from 'lucide-react';
import { useState } from 'react';
import { ReportUserDialog } from './ReportUserDialog';
import { Button } from '@/src/components/ui/button';
import { useTranslation } from 'react-i18next';
import { tribeTone } from '@/src/app/utils/tribeColor';

interface User {
    id: string;
    username: string;
    profileImage?: string;
}

interface UserListProps {
    users: User[];
    typingUsers: Set<string>;
    roomId?: string;
}

const TypingDots = () => {
    const dotVariants = {
        initial: { y: 0 },
        animate: { y: -3 }
    };

    const dotTransition = {
        duration: 0.4,
        repeat: Infinity,
        repeatType: "reverse" as const
    };

    return (
        <div className="flex gap-0.5 items-end h-3 mb-0.5 ml-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-1 h-1 bg-tribe-teal-ink rounded-full"
                    variants={dotVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ ...dotTransition, delay: i * 0.1 }}
                />
            ))}
        </div>
    );
};

export function UserList({ users, typingUsers, roomId }: UserListProps) {
    const { t } = useTranslation();
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [userToReport, setUserToReport] = useState<{ id: string, username: string } | null>(null);

    const handleReportClick = (e: React.MouseEvent, user: User) => {
        e.preventDefault();
        e.stopPropagation();
        setUserToReport({ id: user.id, username: user.username });
        setReportDialogOpen(true);
    };

    const getInitials = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="bg-chat-chrome backdrop-blur-xl border-l border-border/60 h-full px-3 py-4 flex flex-col gap-3">
            <h2 className="px-2 text-sm font-semibold flex items-center gap-2">
                {t('chat.user_list.title')}
                <span className="text-xs font-semibold tabular-nums bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {users.length}
                </span>
            </h2>

            <div className="flex flex-col gap-0.5 overflow-y-auto scrollbar-thin-light">
                <AnimatePresence mode="popLayout">
                    {users.map((user, index) => {
                        const isTyping = typingUsers.has(user.username);
                        const isAnonymous = user.id === user.username;

                        const userContent = (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0, transition: { delay: Math.min(index, 8) * 0.03, duration: 0.25, ease: [0.23, 1, 0.32, 1] } }}
                                exit={{ opacity: 0, x: 10 }}
                                className={cn(
                                    "group flex items-center gap-3 px-2 py-2 rounded-xl transition-colors duration-150",
                                    !isAnonymous && "cursor-pointer hover:bg-accent",
                                    isTyping && "bg-tribe-teal/10 hover:bg-tribe-teal/15"
                                )}
                            >
                                <div className="relative">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage
                                            src={user.profileImage || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`}
                                            alt={`${user.username}'s profile picture`}
                                        />
                                        <AvatarFallback className={tribeTone(user.username).soft}>
                                            {getInitials(user.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-presence ring-2 ring-background rounded-full" aria-hidden="true"></span>
                                </div>

                                <div className="flex flex-col justify-center min-w-0 flex-1">
                                    <span className={cn(
                                        "font-semibold text-sm truncate leading-none mb-1 transition-colors",
                                        !isAnonymous && "group-hover:text-foreground"
                                    )}>
                                        {user.username}
                                    </span>

                                    <div className="h-4 flex items-center">
                                        <AnimatePresence mode="wait">
                                            {isTyping ? (
                                                <motion.div
                                                    key="typing"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="flex items-center text-xs text-tribe-teal-ink font-medium"
                                                >
                                                    <span>{t('chat.user_list.typing')}</span>
                                                    <TypingDots />
                                                </motion.div>
                                            ) : (
                                                <motion.span
                                                    key="idle"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-xs text-muted-foreground/70 truncate"
                                                >
                                                    {isAnonymous ? t('chat.user_list.guest') : t('chat.user_list.view_profile')}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {!isAnonymous && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={t('chat.user_list.report', { username: user.username })}
                                        className="size-8 transition-[opacity,background-color,color] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => handleReportClick(e, user)}
                                    >
                                        <Flag className="w-4 h-4" />
                                    </Button>
                                )}
                            </motion.div>
                        );

                        if (isAnonymous) {
                            return <div key={user.id}>{userContent}</div>;
                        }

                        return (
                            <Link key={user.id} href={`/profile/${encodeURIComponent(user.username)}`}>
                                {userContent}
                            </Link>
                        );
                    })}
                </AnimatePresence>
            </div>

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
