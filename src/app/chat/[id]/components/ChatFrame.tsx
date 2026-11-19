"use client";

import { useChatViewport } from "@/src/app/chat/[id]/hooks/useChatViewport";
import { cn } from "@/src/lib/utils";

/**
 * Root of the chat screen: fixed to the visible viewport (see
 * useChatViewport), so the message list scrolls inside it and the input
 * never detaches from the bottom edge or the keyboard.
 */
export function ChatFrame({ className, children }: { className?: string; children: React.ReactNode }) {
    const ref = useChatViewport<HTMLDivElement>();
    return (
        <div ref={ref} data-keyboard="closed" className={cn("chat-frame", className)}>
            {children}
        </div>
    );
}
