import { TopicBadge } from '@/src/app/components/brand/TopicGlyph';
import { cn } from '@/src/lib/utils';

interface TopicChipProps {
    label: string;
    /** Topic (category) icon from the API; omit for chips without a topic, like "All". */
    icon?: string | null;
    withBadge?: boolean;
    active?: boolean;
    onClick?: () => void;
    /** Small icon after the label (e.g. × to remove, + to add). */
    trailing?: React.ReactNode;
    ariaLabel?: string;
    className?: string;
}

/**
 * Pill for a topic: its glyph on a mini speech bubble in the topic's logo
 * color, then the name. Used by the explore filter and the category picker,
 * so a category looks the same wherever you meet it.
 */
export function TopicChip({ label, icon, withBadge = true, active = false, onClick, trailing, ariaLabel, className }: TopicChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            aria-label={ariaLabel}
            className={cn(
                "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full text-sm font-semibold",
                withBadge ? "pl-2 pr-4" : "px-4",
                "transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                active
                    ? "bg-foreground text-background shadow-[0_4px_12px_-6px_var(--shadow-tint)]"
                    : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground hover:ring-muted-foreground/40",
                className
            )}
        >
            {withBadge && <TopicBadge name={label} icon={icon} size="xs" />}
            {label}
            {trailing}
        </button>
    );
}
