'use client';

import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';
import { BubbleKicker } from '@/src/app/components/brand/BubbleKicker';
import { tribeToneByKey } from '@/src/app/utils/tribeColor';
import { InfoCtaBand } from '@/src/app/(main)/components/InfoCtaBand';
import { cn } from '@/src/lib/utils';
import { LEGAL_CONTACT_EMAIL, LEGAL_DOCS, LEGAL_LINKS, getLegalDoc, type LegalDocId } from './legal-data';

const LINK_CLASS = 'font-semibold text-primary underline-offset-4 hover:underline';

/** Tags allowed in the copy: app links, the privacy inbox (<mail>) and <strong>. */
const TEXT_TAGS = {
    ...Object.fromEntries(
        Object.entries(LEGAL_LINKS).map(([tag, href]) => [tag, <Link key={tag} href={href} className={LINK_CLASS} />])
    ),
    mail: <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className={LINK_CLASS} />,
    strong: <strong className="font-semibold text-foreground" />,
};

/**
 * One legal document (terms, privacy or cookies): a switcher between the
 * three and the section index on the side, and the text set for reading
 * (65ch measure, numbered sections).
 */
export function LegalDocument({ id }: { id: LegalDocId }) {
    const { t, i18n } = useTranslation();
    const doc = getLegalDoc(id);
    const updated = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(new Date(`${doc.updated}T12:00:00`));

    return (
        <div className="mx-auto max-w-[1100px] px-4 pb-20 sm:px-6">
            <div className="grid gap-10 pt-10 md:grid-cols-[220px_minmax(0,1fr)] md:pt-16 lg:gap-16">
                <aside>
                    <nav aria-label={t('legal.nav_label')} className="md:sticky md:top-24">
                        <ul className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
                            {LEGAL_DOCS.map(item => {
                                const active = item.id === id;
                                return (
                                    <li key={item.id} className="shrink-0">
                                        <Link
                                            href={item.href}
                                            aria-current={active ? 'page' : undefined}
                                            className={cn(
                                                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                                                active
                                                    ? 'bg-card text-foreground shadow-[0_1px_2px_var(--shadow-tint)] ring-1 ring-border/70'
                                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                            )}
                                        >
                                            <span aria-hidden="true" className={cn('size-2.5 rounded-full rounded-bl-[2px]', tribeToneByKey(item.tone).fill)} />
                                            {t(`legal.${item.id}.title`)}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        <p className="mt-8 hidden px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:block">{t('legal.on_this_page')}</p>
                        <ol className="mt-2 hidden space-y-0.5 md:block">
                            {doc.sections.map((section, i) => (
                                <li key={section.id}>
                                    <a href={`#${section.id}`} className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                                        <span className="tabular-nums">{i + 1}.</span> {t(`legal.${id}.${section.id}.title`)}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </aside>

                <article className="min-w-0">
                    <header className="border-b border-border pb-8">
                        <BubbleKicker animated={false} className="mb-4">{t('legal.kicker')}</BubbleKicker>
                        <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">{t(`legal.${id}.title`)}</h1>
                        <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted-foreground md:text-lg">{t(`legal.${id}.intro`)}</p>
                        <p className="mt-5 text-sm text-muted-foreground">{t('legal.updated', { date: updated })}</p>
                    </header>

                    {doc.sections.map((section, i) => {
                        const base = `legal.${id}.${section.id}`;
                        return (
                            <section key={section.id} id={section.id} className="scroll-mt-24 border-b border-border py-8 last:border-b-0">
                                <h2 className="flex items-baseline gap-3 text-xl font-bold tracking-tight">
                                    <span className="text-base tabular-nums text-muted-foreground">{i + 1}.</span>
                                    {t(`${base}.title`)}
                                </h2>
                                <div className="mt-3 max-w-[65ch] space-y-3 text-[15px] leading-relaxed text-foreground/80">
                                    {Array.from({ length: section.paragraphs ?? 1 }, (_, n) => (
                                        <p key={n}><Trans i18nKey={`${base}.p${n + 1}`} components={TEXT_TAGS} /></p>
                                    ))}
                                    {section.items && (
                                        <ul className="space-y-2 pt-1">
                                            {Array.from({ length: section.items }, (_, n) => (
                                                <li key={n} className="flex gap-3">
                                                    <span aria-hidden="true" className="mt-[9px] size-1.5 shrink-0 rounded-full bg-primary" />
                                                    <span><Trans i18nKey={`${base}.item${n + 1}`} components={TEXT_TAGS} /></span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </section>
                        );
                    })}

                    <InfoCtaBand
                        title={t('legal.cta_title')}
                        text={t('legal.cta_text')}
                        href="/faq"
                        action={t('legal.cta_button')}
                        buddy="violet"
                    />
                </article>
            </div>
        </div>
    );
}
