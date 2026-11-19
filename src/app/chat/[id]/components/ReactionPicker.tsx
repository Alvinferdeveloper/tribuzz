'use client';

import { motion } from "framer-motion";

interface ReactionPickerProps {
    onSelect: (emoji: string) => void;
}

export const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export function ReactionPicker({ onSelect }: ReactionPickerProps) {
    return (
        <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-center gap-0.5 bg-popover ring-1 ring-border/70 rounded-full shadow-[var(--menu-shadow)] p-1"
        >
            {commonReactions.map((emoji) => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    className="size-9 flex items-center justify-center rounded-full hover:bg-accent transition-[background-color,transform] duration-150 ease-out hover:scale-110 active:scale-95 text-xl cursor-pointer"
                    aria-label={`React with ${emoji}`}
                >
                    {emoji}
                </button>
            ))}
        </motion.div>
    );
}
