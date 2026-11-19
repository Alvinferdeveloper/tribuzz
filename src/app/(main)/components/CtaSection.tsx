"use client"

import Link from "next/link"
import { forwardRef } from "react"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "@/src/app/lib/i18n"
import { Buddy } from "@/src/app/components/brand/Buddy"
import Reveal from "@/src/app/(main)/components/Reveal"
import type { TribeToneKey } from "@/src/app/utils/tribeColor"

// The crowd peeking over the bottom edge, alternating logo colors.
const CROWD: { tone: TribeToneKey; size: number }[] = [
    { tone: "sun", size: 64 }, { tone: "teal", size: 84 }, { tone: "violet", size: 70 },
    { tone: "sun", size: 92 }, { tone: "teal", size: 66 }, { tone: "violet", size: 80 },
    { tone: "sun", size: 72 },
]

/**
 * Closing call to action: a band drenched in the brand coral with the
 * Buddies peeking over its bottom edge. Both buttons go somewhere real
 * (explore as a guest, or sign up).
 */
const CtaSection = forwardRef<HTMLDivElement>((_, ref) => {
    const { t } = useTranslation()

    return (
        <section id="unete" ref={ref} className="py-16 md:py-24">
            <div className="mx-auto max-w-[1200px] px-4 md:px-6">
                <Reveal direction="up">
                    <div className="relative overflow-hidden rounded-[14px] bg-primary px-6 pt-14 pb-36 text-primary-foreground sm:px-12 md:pt-20 md:pb-40">
                        {/* Soft logo-bubble glow behind the copy */}
                        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[oklch(1_0_0/0.1)]" />

                        <div className="relative max-w-2xl">
                            <h2 className="text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-tight">
                                {t("landing.final.title")}
                            </h2>
                            <p className="mt-5 max-w-xl text-lg leading-relaxed opacity-90">
                                {t("landing.final.subtitle")}
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/tribus"
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[oklch(0.99_0.004_255)] px-6 text-base font-semibold text-[oklch(0.2_0.04_265)] transition-[transform,background-color] duration-150 ease-out hover:bg-white active:scale-[0.97]"
                                >
                                    {t("landing.final.explore")}
                                    <ArrowRight className="size-4" />
                                </Link>
                                <Link
                                    href="/signup"
                                    className="inline-flex h-12 items-center justify-center rounded-xl px-6 text-base font-semibold ring-2 ring-current/40 transition-[transform,background-color] duration-150 ease-out hover:bg-[oklch(1_0_0/0.12)] active:scale-[0.97]"
                                >
                                    {t("landing.final.signup")}
                                </Link>
                            </div>
                        </div>

                        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-5 flex items-end justify-center gap-3 sm:gap-5">
                            {CROWD.map((b, i) => (
                                <Buddy
                                    key={i}
                                    name={`${b.tone}-${i}`}
                                    tone={b.tone}
                                    size={b.size}
                                    delay={i * 0.25}
                                    className={i === 0 || i === CROWD.length - 1 ? "hidden sm:block" : undefined}
                                />
                            ))}
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    )
})

CtaSection.displayName = "CtaSection"

export default CtaSection
