/**
 * Structure of the FAQ. The copy lives in the locales under
 * `faq.section.<id>` and `faq.q.<id>.{q,a}`; answers can wrap words in the
 * tags below (e.g. "<create>Crear tribu</create>") to link to that screen.
 */

export const FAQ_SECTIONS = [
    { id: 'start', questions: ['free', 'account', 'find'] },
    { id: 'tribes', questions: ['create', 'review', 'limit', 'rejected'] },
    { id: 'chat', questions: ['media', 'favorites'] },
    { id: 'safety', questions: ['report', 'email', 'profile', 'data'] },
] as const;

export type FaqSectionId = (typeof FAQ_SECTIONS)[number]['id'];

/** Link tags available inside answers. */
export const FAQ_LINKS = {
    explore: '/tribus',
    create: '/tribus/create',
    mine: '/tribus/my-rooms',
    favorites: '/tribus/favorites',
    profile: '/profile',
    guide: '/guia-comunidad',
    privacy: '/legal/privacidad',
} as const;

/** Answer text without the link tags (search, structured data). */
export function stripLinkTags(text: string) {
    return text.replace(/<\/?[a-z]+>/g, '');
}
