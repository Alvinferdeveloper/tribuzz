'use client';

import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { Buddy } from '@/src/app/components/brand/Buddy';
import { NightSky } from '@/src/app/components/brand/NightSky';
import { TopicBadge } from '@/src/app/components/brand/TopicGlyph';
import { ConversationGlyph, CONVERSATION_TYPES, type ConversationType } from '@/src/app/components/brand/ConversationGlyph';
import { useDebounce } from '@/src/app/hooks/useDebounce';
import { ProfileFormValues } from '@/src/lib/validators/user';
import type { Hobby } from './OnboardingSteps';
import type { OnboardingStep } from '../AdditionalInfoModal';
import { cn } from '@/src/lib/utils';

/** Until a name is typed, the Buddy wears the brand coral. */
const DEFAULT_BUDDY = 'tribuzz';

function useOnboardingValues() {
    const { watch } = useFormContext<ProfileFormValues>();
    const username = (watch('username') ?? '').trim();
    // Debounced so the Buddy doesn't flash a new color on every keystroke.
    const settledName = useDebounce(username, 450);
    return {
        username,
        buddyName: settledName.length >= 3 ? settledName : DEFAULT_BUDDY,
        hobbyIds: watch('selectedHobbies') ?? [],
        conversation: watch('conversationType') as ConversationType | '',
    };
}

/** What the Buddy says at each step. */
function useBuddyLine(step: OnboardingStep) {
    const { t } = useTranslation();
    const { username, hobbyIds, conversation } = useOnboardingValues();
    switch (step) {
        case 'welcome': return t('onboarding.buddy.welcome');
        case 'identity': return username.length >= 3 ? t('onboarding.buddy.identity_named', { name: username }) : t('onboarding.buddy.identity');
        case 'hobbies': return hobbyIds.length > 0 ? t('onboarding.buddy.hobbies_picked') : t('onboarding.buddy.hobbies');
        case 'conversation': return conversation ? t('onboarding.buddy.conversation_picked') : t('onboarding.buddy.conversation');
        case 'done': return t('onboarding.buddy.done');
    }
}

/** The person's Buddy; hops twice when the profile is done. */
function StageBuddy({ name, size, celebrating }: { name: string; size: number; celebrating: boolean }) {
    return (
        <motion.div
            animate={celebrating ? { y: [0, -16, 0, -9, 0] } : { y: 0 }}
            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        >
            <Buddy name={name} size={size} />
        </motion.div>
    );
}

function SpeechBubble({ text, className }: { text: string; className?: string }) {
    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.p
                key={text}
                initial={{ opacity: 0, transform: 'translateY(4px) scale(0.96)' }}
                animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                exit={{ opacity: 0, transform: 'translateY(-2px) scale(0.98)' }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className={cn(
                    'w-fit max-w-full rounded-[18px] rounded-bl-[5px] bg-[oklch(0.97_0.01_255)] px-4 py-2 font-bold text-[oklch(0.2_0.04_265)] shadow-[0_8px_20px_-10px_oklch(0.05_0.03_265/0.6)]',
                    className
                )}
            >
                {text}
            </motion.p>
        </AnimatePresence>
    );
}

/**
 * The brand side of the onboarding, always at night: the person's own
 * Buddy talking them through it and, on larger screens, a live preview of
 * the profile they're building. On phones it's a compact strip on top.
 */
export function OnboardingStage({ step, hobbies }: { step: OnboardingStep; hobbies: Hobby[] }) {
    const { t } = useTranslation();
    const { username, buddyName, hobbyIds, conversation } = useOnboardingValues();
    const line = useBuddyLine(step);
    const chosenHobbies = hobbies.filter(h => hobbyIds.includes(h.id));
    const conversationKey = CONVERSATION_TYPES.find(c => c.value === conversation)?.key;
    const celebrating = step === 'done';

    return (
        <aside className="relative isolate overflow-hidden text-white">
            <NightSky stars={[46, 18]} fireflies={4} moon className="-z-10" />

            {/* Phones: compact strip */}
            <div className="flex items-end gap-3 px-5 pb-4 pt-5 md:hidden">
                <StageBuddy name={buddyName} size={60} celebrating={celebrating} />
                <SpeechBubble text={line} className="mb-6 text-sm" />
            </div>

            {/* Larger screens: Buddy and the profile taking shape */}
            <div className="hidden h-full flex-col px-7 pb-7 pt-10 md:flex">
                <div className="flex flex-1 flex-col items-center justify-center">
                    <SpeechBubble text={line} className="mb-4 text-[15px]" />
                    <StageBuddy name={buddyName} size={128} celebrating={celebrating} />
                </div>

                <div className="rounded-[10px] bg-white/[0.07] p-4 ring-1 ring-white/15 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">{t('onboarding.preview.label')}</p>
                    <p className={cn('mt-1.5 truncate text-lg font-bold', !username && 'text-white/40')}>
                        {username ? `@${username}` : t('onboarding.preview.name_placeholder')}
                    </p>

                    <div className="mt-3 flex min-h-8 flex-wrap gap-1.5">
                        {chosenHobbies.length > 0 ? (
                            chosenHobbies.slice(0, 7).map(h => (
                                <motion.span key={h.id} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 26 }}>
                                    <TopicBadge name={h.name} icon={h.icon} size="sm" />
                                </motion.span>
                            ))
                        ) : (
                            <span className="text-sm text-white/40">{t('onboarding.preview.hobbies_placeholder')}</span>
                        )}
                        {chosenHobbies.length > 7 && (
                            <span className="flex size-8 items-center justify-center rounded-[11px] bg-white/15 text-xs font-bold">+{chosenHobbies.length - 7}</span>
                        )}
                    </div>

                    <div className="mt-3 border-t border-white/10 pt-3 text-sm">
                        {conversationKey ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold">
                                <ConversationGlyph type={conversation as ConversationType} className="size-4" />
                                {t(`profile.conversation_type.${conversationKey}`)}
                            </span>
                        ) : (
                            <span className="text-white/40">{t('onboarding.preview.conversation_placeholder')}</span>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}

/** First screen: what this is, how long it takes. */
export function OnboardingWelcome() {
    const { t } = useTranslation();
    const steps = ['identity', 'hobbies', 'conversation'] as const;
    const dots = ['bg-tribe-coral', 'bg-tribe-violet', 'bg-tribe-teal'];
    return (
        <div>
            <h2 className="text-balance text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2rem]">{t('onboarding.welcome.title')}</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">{t('onboarding.welcome.text')}</p>

            <ol className="mt-7 space-y-3">
                {steps.map((s, i) => (
                    <li key={s} className="flex items-center gap-3.5">
                        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-[12px] rounded-bl-[4px] text-sm font-bold text-[oklch(0.2_0.04_265)]', dots[i])}>
                            {i + 1}
                        </span>
                        <span className="text-[15px] font-semibold">{t(`onboarding.welcome.step_${s}`)}</span>
                    </li>
                ))}
            </ol>

            <p className="mt-7 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
                <Clock className="size-4" /> {t('onboarding.welcome.time')}
            </p>
        </div>
    );
}

const CONFETTI = [
    { x: '8%', delay: 0, color: 'bg-tribe-sun', shape: 'rounded-tr-[2px]' },
    { x: '22%', delay: 0.15, color: 'bg-tribe-coral', shape: 'rounded-bl-[2px]' },
    { x: '38%', delay: 0.05, color: 'bg-tribe-teal', shape: 'rounded-tl-[2px]' },
    { x: '55%', delay: 0.2, color: 'bg-tribe-violet', shape: 'rounded-br-[2px]' },
    { x: '70%', delay: 0.1, color: 'bg-tribe-sun', shape: 'rounded-bl-[2px]' },
    { x: '86%', delay: 0.25, color: 'bg-tribe-coral', shape: 'rounded-tr-[2px]' },
];

/** Last screen: a little celebration, then into the tribes. */
export function OnboardingDone() {
    const { t } = useTranslation();
    const { username } = useOnboardingValues();
    return (
        <div className="relative">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-4 h-24">
                {CONFETTI.map((c, i) => (
                    <motion.span
                        key={i}
                        className={cn('absolute top-10 size-3 rounded-full', c.color, c.shape)}
                        style={{ left: c.x }}
                        initial={{ y: 0, opacity: 0, rotate: 0 }}
                        animate={{ y: [-6, -46, -30], opacity: [0, 1, 0], rotate: [0, 90, 160] }}
                        transition={{ duration: 1.4, delay: c.delay, ease: 'easeOut' }}
                    />
                ))}
            </div>
            <h2 className="pt-10 text-balance text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
                {t('onboarding.done.title', { name: username })}
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">{t('onboarding.done.text')}</p>
        </div>
    );
}
