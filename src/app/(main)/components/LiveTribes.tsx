"use client"

import Link from "next/link"
import { useState } from "react"
import { useTranslation } from "@/src/app/lib/i18n"
import useRoom, { type Room } from "@/src/app/tribus/hooks/useRoom"
import { useRoomUserCounts } from "@/src/app/tribus/hooks/useRoomUserCounts"
import { tribeTone } from "@/src/app/utils/tribeColor"
import Reveal from "@/src/app/(main)/components/Reveal"
import { cn } from "@/src/lib/utils"

/**
 * "Happening now": a slow marquee of real tribes from the API, each with its
 * bubble icon and how many people are in it right now. Honest, live social
 * proof instead of made-up totals. Pauses on hover/focus; with reduced motion
 * it becomes a static, scrollable row. Hidden if there are no tribes to show.
 */
export default function LiveTribes() {
    const { t } = useTranslation()
    const { rooms, loading } = useRoom("")
    const { userCounts } = useRoomUserCounts()

    if (!loading && rooms.length === 0) return null

    // Busiest first, so the strip leads with where people actually are.
    const tribes = [...rooms].sort((a, b) => (userCounts[b.id] || 0) - (userCounts[a.id] || 0))

    return (
        <section className="pt-10 pb-8 md:pt-14 md:pb-10">
            <Reveal direction="up" className="mx-auto mb-8 max-w-[1200px] px-4 md:px-6">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("landing.live.title")}</h2>
                <p className="mt-2 max-w-xl text-muted-foreground">{t("landing.live.subtitle")}</p>
            </Reveal>

            {/* Two rows drifting in opposite directions. The second shows the same
                tribes in another order (and a touch slower) so it never mirrors
                the first; it is decorative for assistive tech and keyboard. */}
            <div className="brand-marquee-pause flex flex-col gap-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                {loading && rooms.length === 0 ? (
                    [0, 1].map((row) => (
                        <div key={row} className={cn("flex gap-3 overflow-hidden", row === 1 ? "pl-24" : "px-4")}>
                            {Array.from({ length: 6 }, (_, i) => (
                                <span key={i} className="h-14 w-56 shrink-0 animate-pulse rounded-full bg-muted" />
                            ))}
                        </div>
                    ))
                ) : (
                    <>
                        <MarqueeRow tribes={tribes} userCounts={userCounts} />
                        <MarqueeRow tribes={[...tribes].reverse()} userCounts={userCounts} reverse decorative />
                    </>
                )}
            </div>
        </section>
    )
}

const MIN_PILLS_PER_SET = 8

function MarqueeRow({ tribes, userCounts, reverse = false, decorative = false }: {
    tribes: Room[]
    userCounts: Record<string, number>
    /** Drift left to right instead of right to left. */
    reverse?: boolean
    /** Hidden from assistive tech and the tab order (a second view of the same tribes). */
    decorative?: boolean
}) {
    // Repeat the list until one set is wider than any screen (~8 pills), so the
    // loop never shows a gap when there are only a few tribes.
    const base: Room[] = []
    while (base.length < MIN_PILLS_PER_SET) base.push(...tribes)
    // ~5s per pill keeps the pace calm whatever the count; the reverse row runs slower.
    const seconds = base.length * (reverse ? 6 : 5)

    return (
        <div className="overflow-hidden motion-reduce:overflow-x-auto" aria-hidden={decorative || undefined}>
            <ul
                className="brand-anim brand-marquee flex w-max gap-3 px-2 py-1"
                style={{ ["--marquee-duration" as string]: `${seconds}s`, animationDirection: reverse ? "reverse" : undefined }}
            >
                {/* Rendered twice for a seamless loop; the copy is hidden from assistive tech. */}
                {[...base, ...base].map((room, i) => {
                    // Only the first occurrence of each tribe is focusable / announced.
                    const copy = i >= tribes.length
                    return (
                        <li key={`${room.id}-${i}`} aria-hidden={copy || undefined}>
                            <TribePill room={room} online={userCounts[room.id] || 0} tabIndex={decorative || copy ? -1 : 0} />
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

function TribePill({ room, online, tabIndex }: { room: Room; online: number; tabIndex: number }) {
    const { t } = useTranslation()
    const tone = tribeTone(room.name)
    const [failed, setFailed] = useState(false)

    return (
        <Link
            href={`/chat/${room.id}`}
            tabIndex={tabIndex}
            className="group flex h-14 items-center gap-3 rounded-full bg-card py-1.5 pl-1.5 pr-5 ring-1 ring-border/70 transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_var(--shadow-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            <span className={cn("flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[16px]", tone.fill, tone.tail)}>
                {room.server_icon && !failed ? (
                    <img src={room.server_icon} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
                ) : (
                    <span className="text-base font-bold text-[oklch(0.2_0.04_265)]">{room.name.charAt(0).toUpperCase()}</span>
                )}
            </span>
            <span className="leading-tight">
                <span className="block max-w-48 truncate text-sm font-semibold">{room.name}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn("size-1.5 rounded-full", online > 0 ? "bg-presence" : "bg-muted-foreground/50")} />
                    {t("layout.rail.online", { count: online })}
                </span>
            </span>
        </Link>
    )
}
