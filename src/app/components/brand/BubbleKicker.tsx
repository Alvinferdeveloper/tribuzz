import { cn } from "@/src/lib/utils";

interface BubbleKickerProps {
    children: React.ReactNode;
    /** `surface` on page backgrounds; `glass` over imagery (e.g. a hero photo). */
    variant?: "surface" | "glass";
    /** Animate the typing dots. Off where the label shouldn't compete for attention. */
    animated?: boolean;
    className?: string;
}

/**
 * Small label above a headline, shaped like a Tribuzz chat bubble (pointed
 * bottom-left corner, as in the logo) with the "someone is typing" dots.
 * Says "this place is active" in the product's own language, instead of the
 * generic pulsing status dot.
 */
export function BubbleKicker({ children, variant = "surface", animated = true, className }: BubbleKickerProps) {
    const dot = cn("size-1.5 rounded-full", animated && "animate-typing-dot");
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2.5 rounded-[18px] rounded-bl-[5px] py-1.5 pl-3 pr-3.5 text-sm font-semibold",
                variant === "surface"
                    ? "bg-card/80 text-foreground ring-1 ring-border/70 backdrop-blur-sm"
                    : "bg-[oklch(0.16_0.04_265/0.5)] text-white/90 ring-1 ring-white/15",
                className
            )}
        >
            <span aria-hidden="true" className="flex items-center gap-[3px]">
                <span className={cn(dot, "bg-tribe-coral")} />
                <span className={cn(dot, "bg-tribe-sun [animation-delay:160ms]")} />
                <span className={cn(dot, "bg-tribe-teal [animation-delay:320ms]")} />
            </span>
            {children}
        </span>
    );
}
