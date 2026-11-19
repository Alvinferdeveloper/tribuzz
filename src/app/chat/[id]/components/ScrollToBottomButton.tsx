"use client"
import { ArrowDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/src/lib/utils";

interface ScrollToBottomButtonProps {
    visible: boolean;
    unreadCount: number;
    onClick: () => void;
}

export function ScrollToBottomButton({ visible, unreadCount, onClick }: ScrollToBottomButtonProps) {
    const { t } = useTranslation();

    return (
        <button
            onClick={onClick}
            aria-label={t('chat.scroll_to_bottom.label')}
            className={cn(
                "absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full h-9 pl-3 pr-3.5 text-xs font-semibold cursor-pointer shadow-[var(--menu-shadow)]",
                unreadCount > 0 ? "bg-primary text-primary-foreground" : "bg-popover text-popover-foreground ring-1 ring-border/70 hover:bg-accent",
                "transition-[opacity,transform,background-color] duration-200 ease-out active:scale-95",
                visible ? "opacity-100 translate-y-0 scale-100" : "pointer-events-none opacity-0 translate-y-2 scale-95"
            )}
        >
            <ArrowDown className="h-3.5 w-3.5" />
            {unreadCount > 0 ? (
                <span>{t('chat.scroll_to_bottom.unread', { count: unreadCount })}</span>
            ) : (
                <span>{t('chat.scroll_to_bottom.label')}</span>
            )}
        </button>
    );
}
