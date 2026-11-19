"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { commonReactions } from "@/src/app/chat/[id]/components/ReactionPicker";
import { cn } from "@/src/lib/utils";

export interface MessageAction {
    id: string;
    label: string;
    icon: LucideIcon;
    onSelect: () => void;
    destructive?: boolean;
}

interface MessageActionMenuProps {
    /** Bubble's bounding box when the menu opened. */
    anchor: DOMRect;
    /** Own messages sit on the right, so the menu aligns to the right edge. */
    alignEnd: boolean;
    onReact: (emoji: string) => void;
    actions: MessageAction[];
    onClose: () => void;
}

/** Space kept clear at the top for the floating chat header. */
const TOP_CLEARANCE = 76;
const EDGE = 12;
const GAP = 8;

/**
 * Touch menu for a message (opened with a long press): the reactions are
 * right there, one tap away, with the actions under them. Rendered in a
 * portal so the list's fade mask and stacking can't clip it; placed above
 * the bubble when it fits, otherwise below, always inside the visible area
 * (which shrinks when the keyboard is open).
 */
export function MessageActionMenu({ anchor, alignEnd, onReact, actions, onClose }: MessageActionMenuProps) {
    const { t } = useTranslation();
    const menuRef = useRef<HTMLDivElement>(null);
    const [top, setTop] = useState<number | null>(null);

    useLayoutEffect(() => {
        const height = menuRef.current?.offsetHeight ?? 0;
        const vv = window.visualViewport;
        const visibleTop = (vv?.offsetTop ?? 0) + TOP_CLEARANCE;
        const visibleBottom = (vv?.offsetTop ?? 0) + (vv?.height ?? window.innerHeight) - EDGE;

        const above = anchor.top - GAP - height;
        const below = anchor.bottom + GAP;
        if (above >= visibleTop) setTop(above);
        else if (below + height <= visibleBottom) setTop(below);
        else setTop(Math.max(visibleTop, visibleBottom - height));
    }, [anchor]);

    const horizontal = alignEnd
        ? { right: Math.max(EDGE, window.innerWidth - anchor.right) }
        : { left: Math.max(EDGE, anchor.left) };

    return createPortal(
        <>
            {/* Transparent catcher: tapping or dragging anywhere else closes the menu. */}
            <div className="fixed inset-0 z-[80]" onClick={onClose} onTouchMove={onClose} />
            <div
                ref={menuRef}
                role="menu"
                aria-label={t('chat.message.actions')}
                className={cn(
                    "fixed z-[90] w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl bg-popover p-1.5 text-popover-foreground shadow-[var(--menu-shadow)] ring-1 ring-border/70",
                    "animate-in fade-in zoom-in-95 duration-150 ease-out",
                    alignEnd ? "origin-bottom-right" : "origin-bottom-left",
                    // Measured first (invisible), then placed.
                    top === null && "invisible"
                )}
                style={{ top: top ?? 0, ...horizontal }}
            >
                <div className="flex items-center justify-between px-1 pb-1.5 pt-0.5">
                    {commonReactions.map((emoji, i) => (
                        <button
                            key={emoji}
                            type="button"
                            role="menuitem"
                            onClick={() => onReact(emoji)}
                            aria-label={t('chat.message.react_with', { emoji })}
                            className="flex size-10 cursor-pointer items-center justify-center rounded-full text-[1.375rem] transition-transform duration-150 ease-out animate-in zoom-in-50 active:scale-90"
                            style={{ animationDelay: `${i * 25}ms`, animationFillMode: "backwards" }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
                <div className="border-t border-border/70 pt-1">
                    {actions.map(({ id, label, icon: Icon, onSelect, destructive }) => (
                        <button
                            key={id}
                            type="button"
                            role="menuitem"
                            onClick={onSelect}
                            className={cn(
                                "flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors active:bg-accent",
                                destructive ? "text-destructive active:bg-destructive/10" : "text-foreground"
                            )}
                        >
                            <Icon className="size-[18px] shrink-0" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </>,
        document.body
    );
}
