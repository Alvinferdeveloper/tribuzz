"use client"
import React from "react";
import { useTranslation } from "react-i18next";

interface TypingIndicatorProps {
    typingUsers: Set<string>;
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
    const { t } = useTranslation();
    if (typingUsers.size === 0) return null;

    const users = Array.from(typingUsers);
    let text = "";

    if (users.length === 1) {
        text = t('chat.typing.single', { username: users[0] });
    } else if (users.length === 2) {
        text = t('chat.typing.double', { user1: users[0], user2: users[1] });
    } else {
        text = t('chat.typing.multiple');
    }

    return (
        <div className="flex items-center gap-2.5 px-4 py-1.5" aria-live="polite">
            <div className="bg-bubble-other ring-1 ring-border/50 rounded-[1rem] rounded-tl-md px-3 flex items-center gap-1 w-fit h-7 shadow-[0_1px_2px_var(--shadow-tint)]">
                <span className="size-1.5 bg-muted-foreground rounded-full animate-typing-dot"></span>
                <span className="size-1.5 bg-muted-foreground rounded-full animate-typing-dot [animation-delay:160ms]"></span>
                <span className="size-1.5 bg-muted-foreground rounded-full animate-typing-dot [animation-delay:320ms]"></span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
                {text}
            </span>
        </div>
    );
}