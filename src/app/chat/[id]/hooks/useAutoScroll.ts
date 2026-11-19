"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { Message } from "@/src/types/chat";

/** Distance from the bottom (px) still counted as "at the bottom". */
const NEAR_BOTTOM_PX = 150;

export function useAutoScroll(messages: Message[]) {
    // Callback ref: the list mounts after the "connecting" screen, so the
    // pane has to be picked up whenever the end marker actually appears.
    const [endMarker, setEndMarker] = useState<HTMLDivElement | null>(null);
    const messagesEndRef = useCallback((node: HTMLDivElement | null) => setEndMarker(node), []);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isNearBottomRef = useRef(true);
    const [isNearBottom, setIsNearBottom] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const prevMessageCountRef = useRef(messages.length);

    const checkNearBottom = useCallback(() => {
        const container = containerRef.current;
        if (!container) return true;
        return container.scrollHeight - container.scrollTop - container.clientHeight < NEAR_BOTTOM_PX;
    }, []);

    // Scrolls only the message pane. scrollIntoView() would also scroll every
    // scrollable ancestor, including the page, which on iOS panned the whole
    // chat and pulled the input away from the bottom.
    const scrollToBottom = useCallback((smooth = true) => {
        const container = containerRef.current;
        if (!container) return;
        container.scrollTo({ top: container.scrollHeight, behavior: smooth ? "smooth" : "instant" });
    }, []);

    const jumpToBottom = useCallback(() => {
        scrollToBottom(true);
        setUnreadCount(0);
    }, [scrollToBottom]);

    useEffect(() => {
        // The scrollable pane is identified by its dedicated class (the
        // overflow comes from it, not from a Tailwind overflow utility).
        const container = endMarker?.closest('.scrollbar-thin-light') as HTMLDivElement | null;
        containerRef.current = container;
        if (!container) return;

        const handleScroll = () => {
            const nearBottom = checkNearBottom();
            isNearBottomRef.current = nearBottom;
            setIsNearBottom(nearBottom);
            if (nearBottom) setUnreadCount(0);
        };

        // Keep the latest message in view when the pane or its content
        // changes size while the reader is at the bottom: keyboard opening,
        // reply/edit bar appearing, images or reactions growing a message.
        const resizeObserver = new ResizeObserver(() => {
            if (isNearBottomRef.current) {
                container.scrollTop = container.scrollHeight;
            }
        });
        resizeObserver.observe(container);
        if (container.firstElementChild) resizeObserver.observe(container.firstElementChild);

        // Open the conversation at the latest message, without animating.
        container.scrollTop = container.scrollHeight;
        container.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            container.removeEventListener("scroll", handleScroll);
            resizeObserver.disconnect();
        };
    }, [endMarker, checkNearBottom]);

    useEffect(() => {
        const newMessageCount = messages.length - prevMessageCountRef.current;
        prevMessageCountRef.current = messages.length;

        if (isNearBottomRef.current) {
            scrollToBottom(messages.length > 0);
        } else if (newMessageCount > 0) {
            setUnreadCount(prev => prev + newMessageCount);
        }
    }, [messages, scrollToBottom]);

    return { messagesEndRef, scrollToBottom: () => scrollToBottom(true), isNearBottom, unreadCount, jumpToBottom };
}
