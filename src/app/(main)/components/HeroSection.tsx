"use client"

import Link from "next/link"
import { forwardRef, useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Trans } from "react-i18next"
import { Button } from "@/src/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { useTranslation } from "@/src/app/lib/i18n"
import { Buddy } from "@/src/app/components/brand/Buddy"
import { Moon } from "@/src/app/components/brand/Moon"
import { tribeTone, tribeToneByKey } from "@/src/app/utils/tribeColor"
import { cn } from "@/src/lib/utils"

/*
 * Demo conversation shown next to the headline. Text comes from i18n
 * (landing.hero.demo.m1..m5) so it follows the visitor's language; names
 * pick their logo color and avatar like real members.
 */
const DEMO_THREAD = [
    { id: "m1", author: "Vale" },
    { id: "m2", author: "Nico", mine: true },
    { id: "m3", author: "Sofi" },
    { id: "m4", author: "Mateo" },
    { id: "m5", author: "Nico", mine: true },
] as const

const VISIBLE_MESSAGES = 4
const STEP_MS = 1800
// Verified Unsplash photo (wet Tokyo street with neon reflections), used as the demo tribe's icon.
const DEMO_TRIBE_ICON = "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&w=96&h=96&q=80"

const avatarFor = (name: string) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`

const HeroSection = forwardRef<HTMLDivElement>((_, ref) => {
    const { t } = useTranslation()

    return (
        <section ref={ref} id="hero" className="relative pt-14 pb-6 md:pt-20 md:pb-8">
            <div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-4 md:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
                <div className="flex flex-col items-start">
                    <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1 text-sm font-semibold text-foreground ring-1 ring-border/70 backdrop-blur-sm">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full rounded-full bg-presence/70 animate-ping [animation-duration:2.4s] motion-reduce:hidden" />
                            <span className="relative inline-flex size-2 rounded-full bg-presence" />
                        </span>
                        {t("landing.hero.badge")}
                    </span>

                    <h1 className="text-balance text-[clamp(2.5rem,6vw,4.75rem)] font-bold leading-[1.02] tracking-tight">
                        <Trans i18nKey="landing.hero.title" components={{ highlight: <span className="text-primary" /> }} />
                    </h1>

                    <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted-foreground md:text-xl">
                        {t("landing.hero.subtitle")}
                    </p>

                    <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <Button asChild size="lg" className="h-12 gap-2 px-6 text-base">
                            <Link href="/tribus">
                                {t("landing.hero.cta_start")}
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                            <Link href="/signup">{t("landing.hero.cta_learn")}</Link>
                        </Button>
                    </div>

                    <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex -space-x-2">
                            {(["coral", "violet", "teal", "sun"] as const).map((tone, i) => (
                                <Buddy key={tone} name={tone} tone={tone} size={30} delay={i * 0.3} />
                            ))}
                        </span>
                        {t("landing.hero.note")}
                    </div>
                </div>

                <HeroConversation />
            </div>
        </section>
    )
})

HeroSection.displayName = "HeroSection"

export default HeroSection

/**
 * A live-looking tribe conversation floating directly on the page's space
 * background (no window): the tribe island with its icon and who's online,
 * the moon, and messages with avatars that write themselves on loop.
 */
function HeroConversation() {
    const { t } = useTranslation()
    const [count, setCount] = useState(1)
    const tribe = t("landing.hero.demo_tribe")
    const tribeColor = tribeToneByKey("violet")

    // Reveal one message per step, pause a beat on the full thread, then start over.
    useEffect(() => {
        const id = window.setInterval(() => {
            setCount((c) => (c >= DEMO_THREAD.length + 1 ? 1 : c + 1))
        }, STEP_MS)
        return () => window.clearInterval(id)
    }, [])

    const shown = DEMO_THREAD.slice(0, Math.min(count, DEMO_THREAD.length))
    const visible = shown.slice(-VISIBLE_MESSAGES)

    return (
        <div aria-hidden="true" className="relative h-[460px] w-full sm:h-[500px]">
            <Moon size={64} className="brand-anim brand-float absolute right-[6%] top-0" />

            {/* Tribe island, like the real chat header */}
            <div className="absolute left-0 top-2 flex items-center gap-2.5 rounded-full bg-card/80 py-1 pl-1 pr-4 ring-1 ring-border/60 shadow-[var(--menu-shadow)] backdrop-blur-md">
                <span className={cn("flex size-10 overflow-hidden rounded-[14px]", tribeColor.fill, tribeColor.tail)}>
                    <img src={DEMO_TRIBE_ICON} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="leading-tight">
                    <span className="block text-sm font-semibold">{tribe}</span>
                    <span className="block text-xs text-muted-foreground">
                        <span className="mr-1 inline-block size-1.5 rounded-full bg-presence align-middle" />
                        {t("layout.rail.online", { count: 6 })}
                    </span>
                </span>
            </div>

            <div className="absolute inset-x-0 top-24 flex flex-col gap-4">
                {visible.map((m) => {
                    const tone = tribeTone(m.author)
                    const mine = "mine" in m && m.mine
                    return (
                        <div
                            key={m.id}
                            className={cn(
                                "flex max-w-[88%] items-end gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500",
                                mine ? "flex-row-reverse self-end" : "self-start"
                            )}
                        >
                            <Avatar className={cn("size-9 shrink-0 ring-2 ring-offset-2 ring-offset-background", tone.ring)}>
                                <AvatarImage src={avatarFor(m.author)} alt="" />
                                <AvatarFallback className={tone.soft}>{m.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className={cn("flex min-w-0 flex-col gap-1", mine ? "items-end" : "items-start")}>
                                <span className={cn("px-1 text-xs font-semibold", mine ? "text-primary" : tone.ink)}>
                                    {mine ? t("chat.message.you") : m.author}
                                </span>
                                <span
                                    className={cn(
                                        "rounded-[1.1rem] px-3.5 py-2 text-[0.95rem] leading-snug shadow-[0_2px_10px_-2px_var(--shadow-tint)]",
                                        mine
                                            ? "rounded-br-md bg-primary text-primary-foreground"
                                            : "rounded-bl-md bg-bubble-other text-bubble-other-foreground ring-1 ring-border/50"
                                    )}
                                >
                                    {t(`landing.hero.demo.${m.id}`)}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
