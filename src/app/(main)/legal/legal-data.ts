import type { TribeToneKey } from '@/src/app/utils/tribeColor';

/**
 * Structure of the legal documents. Copy lives in the locales under
 * `legal.<doc>.{title,intro}` and `legal.<doc>.<section>.{title,p1..pN,item1..N}`.
 * Text can link to app screens with the tags in LEGAL_LINKS
 * (e.g. "<guide>guía</guide>"), to the privacy inbox with <mail>, and use
 * <strong>. Update `updated` whenever a document's content changes.
 */

export type LegalDocId = 'terms' | 'privacy' | 'cookies';

export interface LegalSection {
    id: string;
    /** Number of paragraphs (`p1`…`pN`); defaults to 1. */
    paragraphs?: number;
    /** Number of bullet items (`item1`…`itemN`) after the paragraphs, if any. */
    items?: number;
}

export interface LegalDoc {
    id: LegalDocId;
    href: string;
    tone: TribeToneKey;
    /** ISO date of the last content change. */
    updated: string;
    sections: LegalSection[];
}

export const LEGAL_CONTACT_EMAIL = 'privacidad@tribuzz.chat';

export const LEGAL_DOCS: LegalDoc[] = [
    {
        id: 'terms',
        href: '/legal/terminos',
        tone: 'violet',
        updated: '2026-05-02',
        sections: [{ id: 'use' }, { id: 'content' }, { id: 'termination' }, { id: 'liability' }],
    },
    {
        id: 'privacy',
        href: '/legal/privacidad',
        tone: 'teal',
        updated: '2026-11-19',
        sections: [{ id: 'collect', items: 4 }, { id: 'usage', items: 4 }, { id: 'security' }, { id: 'rights', paragraphs: 2 }],
    },
    {
        id: 'cookies',
        href: '/legal/cookies',
        tone: 'sun',
        updated: '2026-11-19',
        sections: [{ id: 'what' }, { id: 'types', items: 2 }, { id: 'control' }],
    },
];

export const LEGAL_LINKS = {
    guide: '/guia-comunidad',
    profile: '/profile',
} as const;

export function getLegalDoc(id: LegalDocId): LegalDoc {
    const doc = LEGAL_DOCS.find(d => d.id === id);
    if (!doc) throw new Error(`Unknown legal document: ${id}`);
    return doc;
}
