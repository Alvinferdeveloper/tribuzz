'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { BubbleKicker } from '@/src/app/components/brand/BubbleKicker';
import { Buddy } from '@/src/app/components/brand/Buddy';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { InfoCtaBand } from '@/src/app/(main)/components/InfoCtaBand';
import { FAQ_LINKS, FAQ_SECTIONS, stripLinkTags, type FaqSectionId } from './faq-data';

const LINK_CLASS = 'font-semibold text-primary underline-offset-4 hover:underline';

/** <tag>…</tag> in an answer becomes a link to that screen. */
const ANSWER_LINKS = Object.fromEntries(
    Object.entries(FAQ_LINKS).map(([tag, href]) => [tag, <Link key={tag} href={href} className={LINK_CLASS} />])
);

export function FaqView() {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const needle = query.trim().toLowerCase();

    // Sections with only the questions that match the search.
    const sections = useMemo(() => FAQ_SECTIONS.map(section => ({
        id: section.id,
        questions: section.questions.filter(id => {
            if (!needle) return true;
            const text = `${t(`faq.q.${id}.q`)} ${stripLinkTags(t(`faq.q.${id}.a`))}`.toLowerCase();
            return text.includes(needle);
        }),
    })).filter(section => section.questions.length > 0), [needle, t]);

    return (
        <div className="mx-auto max-w-[1100px] px-4 pb-20 sm:px-6">
            {/* Hero: copy and search on the left, a Buddy conversation on the right */}
            <header className="flex items-end justify-between gap-10 pt-10 pb-12 md:pt-16">
                <div className="min-w-0 max-w-xl flex-1">
                    <BubbleKicker animated={false} className="mb-4">{t('faq.kicker')}</BubbleKicker>
                    <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">{t('faq.title')}</h1>
                    <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">{t('faq.subtitle')}</p>

                    <label className="group mt-8 flex h-12 w-full max-w-lg items-center gap-3 rounded-2xl bg-card px-4 shadow-[0_8px_24px_-14px_var(--shadow-tint)] ring-1 ring-border transition-shadow focus-within:ring-2 focus-within:ring-primary/60">
                        <Search className="size-[18px] shrink-0 text-muted-foreground group-focus-within:text-primary" />
                        <span className="sr-only">{t('faq.search_placeholder')}</span>
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('faq.search_placeholder')}
                            className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                aria-label={t('rooms.search.clear')}
                                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </label>
                </div>
                <FaqIllustration />
            </header>

            {sections.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                    <Buddy name="faq-empty" tone="violet" size={70} className="mb-5" />
                    <p className="max-w-sm text-muted-foreground">{t('faq.no_results', { query: query.trim() })}</p>
                    <Button variant="outline" className="mt-5" onClick={() => setQuery('')}>{t('faq.clear_search')}</Button>
                </div>
            ) : (
                <div className="grid gap-10 md:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
                    {/* Section index (desktop) */}
                    <nav aria-label={t('faq.sections_label')} className="hidden md:block">
                        <ul className="sticky top-24 space-y-1">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    >
                                        {t(`faq.section.${section.id}`)}
                                        <span className="text-xs tabular-nums text-muted-foreground/70">{section.questions.length}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="space-y-12">
                        {sections.map(section => (
                            <section key={section.id} id={section.id} className="scroll-mt-24">
                                <h2 className="mb-2 flex items-center gap-2.5 text-lg font-bold tracking-tight">
                                    <span aria-hidden="true" className={cn('size-2.5 rounded-full rounded-bl-[2px]', SECTION_DOT[section.id])} />
                                    {t(`faq.section.${section.id}`)}
                                </h2>
                                <div className="divide-y divide-border border-y border-border">
                                    {section.questions.map(id => (
                                        <FaqItem key={id} id={id} forceOpen={needle.length > 0} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            )}

            <InfoCtaBand
                title={t('faq.cta_title')}
                text={t('faq.cta_text')}
                href="/guia-comunidad"
                action={t('faq.cta_button')}
            />
        </div>
    );
}

const SECTION_DOT: Record<FaqSectionId, string> = {
    start: 'bg-tribe-coral',
    tribes: 'bg-tribe-violet',
    chat: 'bg-tribe-teal',
    safety: 'bg-tribe-sun',
};

/** One question. Native <details>, so it opens with keyboard and without JS. */
function FaqItem({ id, forceOpen }: { id: string; forceOpen: boolean }) {
    const { t } = useTranslation();
    return (
        <details className="group" open={forceOpen || undefined}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 text-[15px] font-semibold leading-snug transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary [&::-webkit-details-marker]:hidden">
                {t(`faq.q.${id}.q`)}
                <span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-[transform,background-color,color] duration-200 ease-out group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground">
                    <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2v8M2 6h8" /></svg>
                </span>
            </summary>
            <p className="max-w-[65ch] pb-5 pr-10 text-[15px] leading-relaxed text-muted-foreground">
                <Trans i18nKey={`faq.q.${id}.a`} components={ANSWER_LINKS} />
            </p>
        </details>
    );
}

/** Help as a conversation: one Buddy asks, another is already typing the answer. */
function FaqIllustration() {
    return (
        <div aria-hidden="true" className="relative hidden h-[170px] w-[250px] shrink-0 md:block">
            <span className="brand-anim brand-float absolute left-0 top-2 flex h-12 w-14 items-center justify-center rounded-[18px] rounded-bl-[5px] bg-tribe-sun text-2xl font-bold text-[oklch(0.2_0.04_265)]">?</span>
            <span className="brand-anim brand-float absolute right-2 top-10 flex h-11 items-center gap-1.5 rounded-[18px] rounded-br-[5px] bg-tribe-teal px-4 [animation-delay:0.9s]">
                {[0, 160, 320].map(d => (
                    <span key={d} className="animate-typing-dot size-2 rounded-full bg-[oklch(0.2_0.04_265/0.6)]" style={{ animationDelay: `${d}ms` }} />
                ))}
            </span>
            <Buddy name="faq-ask" tone="sun" size={74} className="absolute bottom-0 left-4" />
            <Buddy name="faq-answer" tone="teal" size={84} delay={0.5} className="absolute bottom-0 right-6" />
        </div>
    );
}
