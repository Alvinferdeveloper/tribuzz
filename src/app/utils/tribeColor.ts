/**
 * Deterministically maps a name (username, tribe name) to one of the four
 * speech-bubble hues of the Tribuzz logo, so the same person or tribe always
 * wears the same color across the app. Classes are spelled out in full so
 * Tailwind can see them at build time.
 *
 * `tail` gives a bubble shape its pointed corner exactly where that color's
 * bubble has it in the logo (coral bottom-left, violet bottom-right, teal
 * top-left, sun top-right); combine it with a uniform radius such as
 * `rounded-[18px]`. `dot` is the corner opposite-ish to the tail, for badges.
 * `color` (a CSS var) and `corner` serve SVG drawings (see components/brand).
 */
const TRIBE_TONES = [
    {
        ink: 'text-tribe-coral-ink', fill: 'bg-tribe-coral', soft: 'bg-tribe-coral/15', ring: 'ring-tribe-coral/40',
        ringSolid: 'ring-tribe-coral', hoverRing: 'group-hover:ring-tribe-coral', color: 'var(--tribe-coral)', corner: 'bl', tail: 'rounded-bl-[5px]', dot: '-right-1 -top-1',
    },
    {
        ink: 'text-tribe-violet-ink', fill: 'bg-tribe-violet', soft: 'bg-tribe-violet/15', ring: 'ring-tribe-violet/40',
        ringSolid: 'ring-tribe-violet', hoverRing: 'group-hover:ring-tribe-violet', color: 'var(--tribe-violet)', corner: 'br', tail: 'rounded-br-[5px]', dot: '-right-1 -top-1',
    },
    {
        ink: 'text-tribe-teal-ink', fill: 'bg-tribe-teal', soft: 'bg-tribe-teal/20', ring: 'ring-tribe-teal/40',
        ringSolid: 'ring-tribe-teal', hoverRing: 'group-hover:ring-tribe-teal', color: 'var(--tribe-teal)', corner: 'tl', tail: 'rounded-tl-[5px]', dot: '-right-1 -bottom-1',
    },
    {
        ink: 'text-tribe-sun-ink', fill: 'bg-tribe-sun', soft: 'bg-tribe-sun/25', ring: 'ring-tribe-sun/50',
        ringSolid: 'ring-tribe-sun', hoverRing: 'group-hover:ring-tribe-sun', color: 'var(--tribe-sun)', corner: 'tr', tail: 'rounded-tr-[5px]', dot: '-right-1 -bottom-1',
    },
] as const;

export type TribeTone = (typeof TRIBE_TONES)[number];

function hash(value: string): number {
    let h = 0;
    for (let i = 0; i < value.length; i++) {
        h = (h * 31 + value.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

export function tribeTone(name: string | undefined | null): TribeTone {
    return TRIBE_TONES[hash(name || '?') % TRIBE_TONES.length];
}

export type TribeToneKey = 'coral' | 'violet' | 'teal' | 'sun';

/** A specific logo color, for illustrations that compose their own palette. */
export function tribeToneByKey(key: TribeToneKey): TribeTone {
    return TRIBE_TONES[{ coral: 0, violet: 1, teal: 2, sun: 3 }[key]];
}
