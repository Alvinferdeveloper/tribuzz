/**
 * Static scenes for transactional emails, drawn with the same brand pieces
 * as the app (Buddy, bubblePath, tribe palette). Email clients can't render
 * SVG (Gmail strips it), so generate.mjs rasterizes these to PNG.
 *
 * No animation classes, no text: emails are read everywhere and copy lives
 * in the HTML, not in images.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { Buddy } from '@/src/app/components/brand/Buddy';
import { bubblePath, type BubbleCorner } from '@/src/app/components/brand/bubblePath';
import { tribeToneByKey, type TribeToneKey } from '@/src/app/utils/tribeColor';

const INK = 'oklch(0.2 0.04 265)';
const SKY = 'oklch(0.2 0.04 265)';
const ISLAND = 'oklch(0.22 0.045 265)';
const ISLAND_TOP = 'oklch(0.255 0.05 265)';
const GLOW = 'oklch(0.82 0.15 62)';

const HERO_W = 600;
const HERO_H = 260;

/** Deterministic "random" stars, so regenerating gives the same picture. */
function stars(count: number, seed: number) {
    let s = seed;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: rand() * HERO_W,
        y: rand() * HERO_H * 0.55,
        r: rand() < 0.15 ? 1.6 : rand() * 0.8 + 0.6,
        o: 0.35 + rand() * 0.5,
    }));
}

function Sky({ seed }: { seed: number }) {
    return (
        <>
            <rect width={HERO_W} height={HERO_H} fill={SKY} />
            {stars(46, seed).map((st) => (
                <circle key={st.id} cx={st.x} cy={st.y} r={st.r} fill="oklch(0.97 0.02 95)" opacity={st.o} />
            ))}
            <Moon x={528} y={40} />
        </>
    );
}

function Moon({ x, y }: { x: number; y: number }) {
    return (
        <g transform={`translate(${x - 18} ${y - 18})`}>
            <defs>
                <mask id="moon-mask">
                    <rect width="36" height="36" fill="white" />
                    <circle cx="26" cy="14" r="15" fill="black" />
                </mask>
            </defs>
            <circle cx="18" cy="18" r="17" fill="oklch(0.94 0.05 92)" mask="url(#moon-mask)" />
        </g>
    );
}

function Island({ cx, rx }: { cx: number; rx: number }) {
    return (
        <>
            <ellipse cx={cx} cy={HERO_H - 6} rx={rx} ry={30} fill={ISLAND} />
            <ellipse cx={cx} cy={HERO_H - 12} rx={rx - 30} ry={18} fill={ISLAND_TOP} />
        </>
    );
}

function Glow({ id, cx, cy, r, opacity = 0.5 }: { id: string; cx: number; cy: number; r: number; opacity?: number }) {
    return (
        <>
            <defs>
                <radialGradient id={id}>
                    <stop offset="0%" stopColor={GLOW} stopOpacity={opacity} />
                    <stop offset="100%" stopColor={GLOW} stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
        </>
    );
}

function Placed({ x, y, size, tone, lit = false }: { x: number; y: number; size: number; tone: TribeToneKey; lit?: boolean }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            <Buddy name={tone} tone={tone} size={size} lit={lit} animated={false} />
        </g>
    );
}

function SpeechBubble({ x, y, w, h, tone, corner }: { x: number; y: number; w: number; h: number; tone: TribeToneKey | 'light'; corner: BubbleCorner }) {
    const fill = tone === 'light' ? 'oklch(0.97 0.01 255)' : tribeToneByKey(tone).color;
    return <path d={bubblePath(x, y, w, h, corner, Math.min(w, h) * 0.42, 5)} fill={fill} />;
}

function Campfire({ x, y }: { x: number; y: number }) {
    const flame = 'M0 0 C-17 -5 -15 -28 0 -50 C15 -28 17 -5 0 0 Z';
    return (
        <g transform={`translate(${x} ${y}) scale(0.8)`}>
            <rect x="-30" y="-6" width="60" height="11" rx="5.5" fill="oklch(0.38 0.05 50)" transform="rotate(14)" />
            <rect x="-30" y="-6" width="60" height="11" rx="5.5" fill="oklch(0.33 0.05 50)" transform="rotate(-14)" />
            <g transform="translate(0 -4)">
                <g transform="scale(1.15)"><path d={flame} fill="var(--tribe-coral)" /></g>
                <g transform="scale(0.8)"><path d={flame} fill="var(--tribe-sun)" /></g>
                <g transform="scale(0.45)"><path d={flame} fill="oklch(0.97 0.07 95)" /></g>
            </g>
        </g>
    );
}

function TextLines({ x, y, widths, color = INK, opacity = 0.35 }: { x: number; y: number; widths: number[]; color?: string; opacity?: number }) {
    return (
        <>
            {widths.map((w, i) => (
                <rect key={i} x={x} y={y + i * 11} width={w} height="5" rx="2.5" fill={color} opacity={opacity} />
            ))}
        </>
    );
}

function Hero({ seed, children }: { seed: number; children: React.ReactNode }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={HERO_W} height={HERO_H} viewBox={`0 0 ${HERO_W} ${HERO_H}`}>
            <Sky seed={seed} />
            {children}
        </svg>
    );
}

/** A newcomer walks up to a tribe gathered around its fire. */
function WelcomeHero() {
    return (
        <Hero seed={7}>
            <Glow id="welcome-glow" cx={340} cy={226} r={150} />
            <Island cx={300} rx={280} />
            <path d="M-10 236 Q40 226 92 232" fill="none" stroke="oklch(1 0 0 / 0.28)" strokeWidth="3" strokeDasharray="1 11" strokeLinecap="round" />

            {/* The tribe's conversation */}
            <SpeechBubble x={252} y={40} w={128} h={44} tone="violet" corner="bl" />
            <TextLines x={270} y={53} widths={[86, 58]} color="oklch(1 0 0)" opacity={0.75} />
            <SpeechBubble x={360} y={98} w={112} h={40} tone="teal" corner="br" />
            <TextLines x={376} y={110} widths={[78, 50]} />

            <Placed x={306} y={152} size={42} tone="teal" lit />
            <Campfire x={334} y={232} />
            <Placed x={232} y={160} size={66} tone="coral" lit />
            <Placed x={378} y={166} size={60} tone="violet" lit />

            {/* The newcomer saying hi, and the tribe answering with a spark */}
            <SpeechBubble x={56} y={110} w={96} h={40} tone="light" corner="bl" />
            <TextLines x={72} y={122} widths={[64, 40]} />
            <Placed x={70} y={172} size={54} tone="sun" />
            <path d="M210 112 q3 13 15 15 q-12 3 -15 15 q-3 -12 -15 -15 q12 -2 15 -15 Z" fill="var(--tribe-sun)" />
        </Hero>
    );
}

/** A Buddy holding up a key: a new way back in. */
function PasswordResetHero() {
    return (
        <Hero seed={21}>
            <Glow id="reset-glow" cx={300} cy={220} r={130} opacity={0.32} />
            <Island cx={300} rx={190} />

            <SpeechBubble x={322} y={54} w={84} h={70} tone="sun" corner="bl" />
            <g transform="translate(364 89)" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="-12" cy="0" r="9" />
                <path d="M-3 0 H20 M12 0 V8 M19 0 V6" />
            </g>
            <Placed x={236} y={150} size={84} tone="violet" />

            <SpeechBubble x={150} y={88} w={44} h={30} tone="teal" corner="br" />
            <SpeechBubble x={432} y={140} w={38} h={26} tone="coral" corner="bl" />
        </Hero>
    );
}

/** A Buddy saying "yes": the address is confirmed. */
function VerificationHero() {
    return (
        <Hero seed={42}>
            <Glow id="verify-glow" cx={300} cy={220} r={130} opacity={0.32} />
            <Island cx={300} rx={190} />

            <SpeechBubble x={322} y={54} w={78} h={70} tone="teal" corner="bl" />
            <path d="M344 90 l11 11 l22 -24" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <Placed x={236} y={150} size={84} tone="coral" />

            <SpeechBubble x={152} y={92} w={44} h={30} tone="sun" corner="br" />
            <SpeechBubble x={430} y={136} w={38} h={26} tone="violet" corner="bl" />
        </Hero>
    );
}

/** The four logo Buddies in a row, for the footer (transparent background). */
function BuddiesRow() {
    const tones: TribeToneKey[] = ['sun', 'violet', 'teal', 'coral'];
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="32" viewBox="0 0 128 32">
            {tones.map((tone, i) => (
                <Placed key={tone} x={i * 32 + 2} y={2} size={28} tone={tone} />
            ))}
        </svg>
    );
}

export const scenes: Record<string, () => string> = {
    'hero-welcome': () => renderToStaticMarkup(<WelcomeHero />),
    'hero-password-reset': () => renderToStaticMarkup(<PasswordResetHero />),
    'hero-verification': () => renderToStaticMarkup(<VerificationHero />),
    'buddies-row': () => renderToStaticMarkup(<BuddiesRow />),
};
