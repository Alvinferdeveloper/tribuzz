'use client';

import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import { BubbleKicker } from '@/src/app/components/brand/BubbleKicker';
import { Buddy } from '@/src/app/components/brand/Buddy';
import { SafetyIllustration } from '@/src/app/components/brand/FeatureIllustrations';
import { tribeToneByKey, type TribeToneKey } from '@/src/app/utils/tribeColor';
import { InfoCtaBand } from '@/src/app/(main)/components/InfoCtaBand';
import { cn } from '@/src/lib/utils';
import { GUIDE_RULES, REPORT_STEPS } from './guide-data';

export function GuideView() {
    const { t } = useTranslation();

    return (
        <div className="mx-auto max-w-[1100px] px-4 pb-20 sm:px-6">
            <header className="grid items-center gap-8 pt-10 pb-6 md:grid-cols-[minmax(0,1fr)_340px] md:pt-16">
                <div className="max-w-xl">
                    <BubbleKicker animated={false} className="mb-4">{t('guide.kicker')}</BubbleKicker>
                    <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">{t('guide.title')}</h1>
                    <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">{t('guide.subtitle')}</p>
                </div>
                <div className="mx-auto hidden h-[250px] w-full max-w-[330px] md:block">
                    <SafetyIllustration label={t('guide.illustration_label')} />
                </div>
            </header>

            {/* The rules, each with a message that fits and one that doesn't */}
            <section aria-labelledby="guide-rules" className="mt-10">
                <h2 id="guide-rules" className="text-2xl font-bold tracking-tight">{t('guide.rules_title')}</h2>
                <ol className="mt-6 border-b border-border">
                    {GUIDE_RULES.map((rule, i) => (
                        <li key={rule.id} className="grid gap-6 border-t border-border py-9 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
                            <div className="flex gap-4">
                                <RuleNumber n={i + 1} tone={rule.tone} />
                                <div className="min-w-0">
                                    <h3 className="text-xl font-bold tracking-tight">{t(`guide.rule.${rule.id}.title`)}</h3>
                                    <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground">{t(`guide.rule.${rule.id}.text`)}</p>
                                </div>
                            </div>
                            <div className="space-y-3 lg:pt-1">
                                <ExampleMessage kind="do" text={t(`guide.rule.${rule.id}.do`)} />
                                <ExampleMessage kind="dont" text={t(`guide.rule.${rule.id}.dont`)} />
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Reporting, step by step */}
            <section aria-labelledby="guide-report" className="mt-16 rounded-[10px] bg-card p-6 shadow-[var(--card-shadow)] ring-1 ring-border/70 sm:p-10">
                <h2 id="guide-report" className="text-2xl font-bold tracking-tight">{t('guide.report.title')}</h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{t('guide.report.text')}</p>
                <ol className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-4">
                    {REPORT_STEPS.map((step, i) => (
                        <li key={step} className="relative">
                            {/* Connector to the next step */}
                            {i < REPORT_STEPS.length - 1 && (
                                <span aria-hidden="true" className="absolute left-12 right-0 top-[18px] hidden h-0.5 rounded-full bg-border sm:block" />
                            )}
                            <span className="relative flex size-9 items-center justify-center rounded-[12px] rounded-bl-[4px] bg-primary text-sm font-bold text-primary-foreground">
                                {i + 1}
                            </span>
                            <h3 className="mt-4 font-bold tracking-tight">{t(`guide.report.step.${step}.title`)}</h3>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(`guide.report.step.${step}.text`)}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* What moderation does */}
            <section aria-labelledby="guide-after" className="mt-16">
                <h2 id="guide-after" className="text-2xl font-bold tracking-tight">{t('guide.after.title')}</h2>
                <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
                    {(['accounts', 'tribes'] as const).map((block, i) => (
                        <div key={block}>
                            <h3 className="flex items-center gap-2.5 font-bold tracking-tight">
                                <span aria-hidden="true" className={cn('size-2.5 rounded-full rounded-bl-[2px]', i === 0 ? 'bg-tribe-violet' : 'bg-tribe-teal')} />
                                {t(`guide.after.${block}.title`)}
                            </h3>
                            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t(`guide.after.${block}.text`)}</p>
                        </div>
                    ))}
                </div>
            </section>

            <InfoCtaBand
                title={t('guide.cta_title')}
                text={t('guide.cta_text')}
                href="/tribus"
                action={t('guide.cta_button')}
                buddy="teal"
            />
        </div>
    );
}

/** The rule's number in a logo-colored speech bubble. */
function RuleNumber({ n, tone }: { n: number; tone: TribeToneKey }) {
    const t = tribeToneByKey(tone);
    return (
        <span aria-hidden="true" className={cn('flex size-11 shrink-0 items-center justify-center rounded-[16px] text-lg font-bold text-[oklch(0.2_0.04_265)]', t.fill, t.tail)}>
            {n}
        </span>
    );
}

/** A sample chat message, tagged as one that fits ("do") or one that doesn't ("dont"). */
function ExampleMessage({ kind, text }: { kind: 'do' | 'dont'; text: string }) {
    const { t } = useTranslation();
    const good = kind === 'do';
    return (
        <div className="flex items-end gap-2.5">
            <Buddy name={`example-${kind}`} tone={good ? 'teal' : 'violet'} size={30} animated={false} className={cn(!good && 'opacity-70')} />
            <div className="min-w-0">
                <span className={cn(
                    'mb-1 inline-flex items-center gap-1 text-xs font-bold',
                    good ? 'text-tribe-teal-ink' : 'text-destructive'
                )}>
                    {good ? <Check className="size-3.5" strokeWidth={3} /> : <X className="size-3.5" strokeWidth={3} />}
                    {t(good ? 'guide.do_label' : 'guide.dont_label')}
                </span>
                <p className={cn(
                    'rounded-[16px] rounded-bl-[4px] px-3.5 py-2 text-[15px] leading-snug',
                    good
                        ? 'bg-card text-card-foreground shadow-[0_1px_2px_var(--shadow-tint)] ring-1 ring-border/70'
                        : 'bg-destructive/8 text-foreground/70 ring-1 ring-destructive/25'
                )}>
                    {text}
                </p>
            </div>
        </div>
    );
}
