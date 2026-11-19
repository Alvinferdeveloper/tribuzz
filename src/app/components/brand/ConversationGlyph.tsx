import { tribeToneByKey, type TribeToneKey } from "@/src/app/utils/tribeColor";
import { cn } from "@/src/lib/utils";

/**
 * The four conversation styles people pick on their profile, each with its
 * own glyph (brand line style) and logo color.
 */

export type ConversationType = "CASUAL" | "DEEP" | "LEARNING" | "SHARING";

export const CONVERSATION_TYPES: { value: ConversationType; key: string; tone: TribeToneKey }[] = [
    { value: "CASUAL", key: "casual", tone: "sun" },
    { value: "DEEP", key: "deep", tone: "violet" },
    { value: "LEARNING", key: "learning", tone: "teal" },
    { value: "SHARING", key: "sharing", tone: "coral" },
];

const GLYPHS: Record<ConversationType, React.ReactNode> = {
    // A big laugh: light, easygoing chat.
    CASUAL: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M8 13.5c1 2 2.4 3 4 3s3-1 4-3z" />
            <path d="M9 9.5h.01M15 9.5h.01" strokeWidth={2.8} />
        </>
    ),
    // The moon of late-night talks.
    DEEP: (
        <>
            <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />
            <path d="M17 4.5v3M15.5 6h3" />
        </>
    ),
    // A light bulb: learning something new.
    LEARNING: (
        <>
            <path d="M9 17.5h6M10 20.5h4" />
            <path d="M12 3.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V17.5h5.2v-1.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z" />
        </>
    ),
    // Two bubbles passing a story back and forth.
    SHARING: (
        <>
            <path d="M4 5.5h9a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8l-4 3z" />
            <path d="M15 9.5h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-.5V20l-3-2.5H12a2 2 0 0 1-2-2v-1" />
        </>
    ),
};

export function ConversationGlyph({ type, className }: { type: ConversationType; className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn("size-5 shrink-0", className)}
        >
            {GLYPHS[type]}
        </svg>
    );
}

/** The glyph on a speech bubble in the style's logo color. */
export function ConversationBadge({ type, className }: { type: ConversationType; className?: string }) {
    const item = CONVERSATION_TYPES.find(c => c.value === type);
    const tone = tribeToneByKey(item?.tone ?? "coral");
    return (
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-[15px] text-[oklch(0.2_0.04_265)]", tone.fill, tone.tail, className)}>
            <ConversationGlyph type={type} className="size-6" />
        </span>
    );
}
