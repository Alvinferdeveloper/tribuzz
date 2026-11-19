"use client"
import { tribeTone } from "@/src/app/utils/tribeColor";
import { cn } from "@/src/lib/utils";

interface TypingIndicatorProps {
    typingUsers: Set<string>;
}

/**
 * A typing bubble above the composer, preceded by a mini bubble in the color
 * of each person typing (up to three). The names are spelled out in the chat
 * header, which also announces them to screen readers, so no caption here.
 */
export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
    if (typingUsers.size === 0) return null;
    const users = Array.from(typingUsers).slice(0, 3);

    return (
        <div aria-hidden="true" className="flex items-center gap-2 px-4 py-1.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="flex -space-x-1.5">
                {users.map((name) => {
                    const tone = tribeTone(name);
                    return <span key={name} className={cn("size-5 rounded-[45%] ring-2 ring-[var(--background)]", tone.fill, tone.tail)} />;
                })}
            </div>
            <div className="flex h-7 w-fit items-center gap-1 rounded-[1rem] rounded-tl-md bg-bubble-other px-3 ring-1 ring-border/50 shadow-[0_1px_2px_var(--shadow-tint)]">
                <span className="size-1.5 rounded-full bg-muted-foreground animate-typing-dot" />
                <span className="size-1.5 rounded-full bg-muted-foreground animate-typing-dot [animation-delay:160ms]" />
                <span className="size-1.5 rounded-full bg-muted-foreground animate-typing-dot [animation-delay:320ms]" />
            </div>
        </div>
    );
}
