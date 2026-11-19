import type { TribeToneKey } from '@/src/app/utils/tribeColor';

/**
 * Structure of the community guidelines. Copy lives in the locales under
 * `guide.rule.<id>.{title,text,do,dont}`; each rule pairs with a reason
 * people can pick when reporting in the chat (chat.report.reason.*), so
 * what we ask for and what can be reported stay the same list.
 */
export const GUIDE_RULES: { id: string; tone: TribeToneKey }[] = [
    { id: 'respect', tone: 'coral' },
    { id: 'content', tone: 'violet' },
    { id: 'spam', tone: 'sun' },
    { id: 'privacy', tone: 'teal' },
    { id: 'topic', tone: 'coral' },
];

/** How reporting works, step by step (`guide.report.step.<id>`). */
export const REPORT_STEPS = ['open', 'choose', 'review'] as const;
