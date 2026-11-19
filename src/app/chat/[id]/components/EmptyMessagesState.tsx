"use client"
import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EmptyMessagesState() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
            <div className="flex flex-col items-center text-center gap-2 rounded-3xl bg-chat-chrome backdrop-blur-md ring-1 ring-border/50 px-8 py-7 max-w-sm">
            <div className="flex items-center justify-center size-12 rounded-2xl bg-primary/12 text-primary mb-1">
                <Flame className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold">{t('chat.empty_state.title')}</h2>
            <p className="text-sm text-muted-foreground max-w-xs">{t('chat.empty_state.subtitle')}</p>
            </div>
        </div>
    );
}
