"use client"

import Link from "next/link"
import { forwardRef } from "react"
import { ArrowRight } from "lucide-react"
import { Trans } from "react-i18next"
import { useTranslation } from "@/src/app/lib/i18n"
import Reveal from "@/src/app/(main)/components/Reveal"
import { CommunityIllustration, ExploreIllustration, SafetyIllustration } from "@/src/app/components/brand/FeatureIllustrations"
import { tribeToneByKey, type TribeToneKey } from "@/src/app/utils/tribeColor"
import { cn } from "@/src/lib/utils"

type Feature = {
    key: 1 | 2 | 3
    tag: string
    tone: TribeToneKey
    href: string
    Illustration: typeof ExploreIllustration
}

const FEATURES: Feature[] = [
    { key: 1, tag: "tag_explore", tone: "coral", href: "/tribus", Illustration: ExploreIllustration },
    { key: 2, tag: "tag_community", tone: "teal", href: "/tribus", Illustration: CommunityIllustration },
    { key: 3, tag: "tag_privacy", tone: "violet", href: "/guia-comunidad", Illustration: SafetyIllustration },
]

/**
 * "Discover. Connect. Share.": three zig-zag rows, each with its own SVG
 * illustration built from the brand's bubbles and characters, tinted with
 * one logo color. The label is a small colored bubble + word, not a number:
 * these are three facets, not steps.
 */
const FeaturesSection = forwardRef<HTMLDivElement>((_, ref) => {
    const { t } = useTranslation()

    return (
        <section id="como-funciona" ref={ref} className="pt-10 pb-16 md:pt-14 md:pb-28">
            <div className="mx-auto max-w-[1200px] px-4 md:px-6">
                <Reveal direction="up" className="mb-16 max-w-3xl md:mb-24">
                    <h2 className="text-balance text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight">
                        {t("landing.features.heading_discover")}{" "}
                        <span className="text-primary">{t("landing.features.heading_share")}</span>
                    </h2>
                    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                        <Trans i18nKey="landing.features.description" components={{ bold: <span className="font-semibold text-foreground" /> }} />
                    </p>
                </Reveal>

                <div className="flex flex-col gap-20 md:gap-32">
                    {FEATURES.map(({ key, tag, tone, href, Illustration }, index) => {
                        const toneClasses = tribeToneByKey(tone)
                        const reversed = index % 2 === 1
                        return (
                            <div key={key} className={cn("grid items-center gap-10 md:grid-cols-2 md:gap-16", reversed && "md:[&>*:first-child]:order-2")}>
                                <Reveal direction={reversed ? "right" : "left"}>
                                    <div className={cn("relative aspect-[4/3] w-full overflow-hidden rounded-[14px] p-6 ring-1 ring-border/60 sm:p-10", toneClasses.soft)}>
                                        <Illustration label={t(`landing.features.item_${key}_alt`)} />
                                    </div>
                                </Reveal>

                                <Reveal direction="up" delay={0.1}>
                                    <span className="mb-4 inline-flex items-center gap-2 text-sm font-semibold">
                                        <span className={cn("size-3.5 rounded-[45%]", toneClasses.fill, toneClasses.tail)} aria-hidden="true" />
                                        <span className={toneClasses.ink}>{t(`landing.features.${tag}`)}</span>
                                    </span>
                                    <h3 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-[2.5rem]">
                                        {t(`landing.features.item_${key}_title`)}
                                    </h3>
                                    <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
                                        {t(`landing.features.item_${key}_desc`)}
                                    </p>
                                    <Link
                                        href={href}
                                        className="group mt-7 inline-flex items-center gap-2 text-base font-semibold text-primary transition-colors hover:text-primary/80"
                                    >
                                        {t(`landing.features.item_${key}_link`)}
                                        <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                                    </Link>
                                </Reveal>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
})

FeaturesSection.displayName = "FeaturesSection"

export default FeaturesSection
