'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface UserJoinedNotificationProps {
    username: string | null;
}

export function UserJoinedNotification({ username }: UserJoinedNotificationProps) {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const entryTimer = setTimeout(() => {
            setIsVisible(true);
        }, 50);

        const exitTimer = setTimeout(() => {
            setIsVisible(false);
        }, 4000);

        return () => {
            clearTimeout(entryTimer);
            clearTimeout(exitTimer);
        };
    }, []);

    if (!username) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -24, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.95 }}
                    transition={{
                        duration: 0.25,
                        ease: [0.23, 1, 0.32, 1],
                    }}
                    className="fixed top-3 left-1/2 -translate-x-1/2 z-[100]"
                >
                    <div className="flex items-center gap-2.5 rounded-full bg-popover/90 ring-1 ring-border/60 backdrop-blur-md pl-1.5 pr-4 py-1.5 shadow-[var(--menu-shadow)]">
                        <div className="flex size-7 items-center justify-center rounded-full bg-presence/15">
                            <User className="h-3.5 w-3.5 text-presence" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                            {t('chat.user_joined', { username })}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}