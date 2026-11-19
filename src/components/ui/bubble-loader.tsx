import { cn } from "@/src/lib/utils"

/**
 * Tribuzz loading indicator, built from the logo's speech bubbles and colors.
 *
 * - `md` / `lg` ("conversation"): a little chat forms, left, right, left,
 *   each message popping from its tail, then the thread clears and repeats.
 *   For visible waits: page loads, "load more" rows, sections, cards.
 * - `sm` ("wave"): four small message bubbles rising one after another, like
 *   someone typing. For tight spots: inside buttons and inline rows.
 *
 * Sizes are fixed presets so loaders look consistent across the app
 * (sm ~ 16px tall, md 48px, lg 80px). `mono` paints the bubbles in the
 * current text color, for places where the brand colors would clash (e.g.
 * inside a coral primary button).
 *
 * The animation alone says "loading", so there is no visible text: a caption
 * like "Loading more…" next to it only repeats it. `label` is announced to
 * screen readers only.
 *
 * For content with a known shape (cards, lists) prefer a skeleton; use this
 * for waits whose result has no layout yet.
 */

type BubbleLoaderSize = "sm" | "md" | "lg"

interface BubbleLoaderProps {
  size?: BubbleLoaderSize
  mono?: boolean
  /** What is loading, for screen readers only (never shown). */
  label?: string
  className?: string
}

const CONVO_PX: Record<"md" | "lg", number> = { md: 48, lg: 80 }

// Thread order and shape: who speaks (side), message length and color.
const CONVO_ROWS = [
  { color: "bg-tribe-coral", width: "72%", side: "self-start rounded-bl-[4px]", origin: "0% 100%" },
  { color: "bg-tribe-teal", width: "55%", side: "self-end rounded-br-[4px]", origin: "100% 100%" },
  { color: "bg-tribe-violet", width: "64%", side: "self-start rounded-bl-[4px]", origin: "0% 100%" },
] as const

const WAVE_COLORS = ["bg-tribe-sun", "bg-tribe-violet", "bg-tribe-coral", "bg-tribe-teal"] as const

function Conversation({ px, mono }: { px: number; mono: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 flex-col justify-center"
      style={{ width: px * 1.25, height: px, gap: px * 0.09 }}
    >
      {CONVO_ROWS.map((row, i) => (
        <span
          key={row.color}
          className={cn("animate-bubble-convo rounded-full", row.side, mono ? "bg-current" : row.color)}
          style={{
            width: row.width,
            height: px * 0.22,
            transformOrigin: row.origin,
            animationDelay: `${i * 300}ms`,
          }}
        />
      ))}
    </span>
  )
}

function Wave({ mono }: { mono: boolean }) {
  return (
    <span aria-hidden="true" className="flex h-4 shrink-0 items-end gap-[2px] pt-[5px]">
      {WAVE_COLORS.map((color, i) => (
        <span
          key={color}
          className={cn("animate-bubble-wave size-[6px] rounded-[50%] rounded-bl-[1.5px]", mono ? "bg-current" : color)}
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
  )
}

function BubbleLoader({ size = "md", mono = false, label, className }: BubbleLoaderProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      data-slot="bubble-loader"
      className={cn("inline-flex items-center justify-center", className)}
    >
      {size === "sm" ? <Wave mono={mono} /> : <Conversation px={CONVO_PX[size]} mono={mono} />}
      <span className="sr-only">{label ?? "Cargando…"}</span>
    </span>
  )
}

/** Centered full-area loader for page-level waits. */
function PageLoader({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex min-h-[60dvh] w-full items-center justify-center p-6", className)}>
      <BubbleLoader size="lg" label={label} />
    </div>
  )
}

export { BubbleLoader, PageLoader }
export type { BubbleLoaderProps, BubbleLoaderSize }
