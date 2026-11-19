import { cn } from "@/src/lib/utils";

const SPARKS = [
    { sx: "-10px", d: 2.4, delay: 0 },
    { sx: "8px", d: 2.9, delay: 0.7 },
    { sx: "-4px", d: 2.2, delay: 1.3 },
    { sx: "12px", d: 3.1, delay: 1.9 },
    { sx: "2px", d: 2.6, delay: 2.4 },
];

const FLAME = "rounded-[50%_50%_50%_50%/60%_60%_40%_40%]";

/**
 * The tribe's campfire, drawn with the logo's coral and sun: three layered
 * flames that flicker, rising sparks and a soft glow. 80x80px; scale the
 * wrapper (e.g. `scale-75`) for other sizes.
 */
export function Campfire({ className }: { className?: string }) {
    return (
        <div aria-hidden="true" className={cn("relative flex h-20 w-20 items-end justify-center", className)}>
            <span className="brand-anim brand-glow absolute -bottom-10 left-1/2 size-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.8_0.15_60/0.35),transparent_65%)]" />
            {SPARKS.map((s, i) => (
                <span
                    key={i}
                    className="brand-anim brand-spark absolute bottom-8 left-1/2 size-[3px] rounded-full bg-tribe-sun"
                    style={{ ["--sx" as string]: s.sx, animationDuration: `${s.d}s`, animationDelay: `${s.delay}s` }}
                />
            ))}
            <span className={cn("brand-anim brand-flicker absolute bottom-2 h-14 w-11 bg-tribe-coral", FLAME)} />
            <span className={cn("brand-anim brand-flicker absolute bottom-2 h-10 w-8 bg-tribe-sun [animation-duration:1.1s]", FLAME)} />
            <span className={cn("brand-anim brand-flicker absolute bottom-2 h-6 w-4 bg-[oklch(0.97_0.07_95)] [animation-duration:0.8s]", FLAME)} />
            <span className="absolute bottom-0 h-3 w-16 rotate-[14deg] rounded-full bg-[oklch(0.4_0.05_50)]" />
            <span className="absolute bottom-0 h-3 w-16 -rotate-[14deg] rounded-full bg-[oklch(0.35_0.05_50)]" />
        </div>
    );
}
