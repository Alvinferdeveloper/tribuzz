'use client';

import { AuthGuard } from "@/src/app/components/auth/AuthGuard";
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { CreateRoomForm, RoomData } from './components/CreateRoomForm';
import { CustomizeRoom } from './components/CustomizeRoom';
import { TribePreview, TribeDraft } from './components/TribePreview';
import { BubbleKicker } from '@/src/app/components/brand/BubbleKicker';
import { Buddy } from '@/src/app/components/brand/Buddy';
import { cn } from '@/src/lib/utils';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EMPTY_DRAFT: TribeDraft = { name: '', description: '', categories: [] };

const TIP_DOTS = ['bg-tribe-coral', 'bg-tribe-teal', 'bg-tribe-violet'] as const;

/**
 * Split screen: the form starts at the top on the left (no tall header
 * pushing it down) and the brand side lives on the right, in a sticky panel
 * with the Buddies, the live card preview and tips for the current step.
 */
export default function CreateRoomPage() {
    const { t } = useTranslation();
    const [draft, setDraft] = useState<TribeDraft>(EMPTY_DRAFT);
    const [createdRoom, setCreatedRoom] = useState<RoomData | null>(null);
    const [images, setImages] = useState<{ bannerUrl?: string; iconUrl?: string }>({});

    const step = createdRoom ? 2 : 1;
    const handleDraftChange = useCallback((d: TribeDraft) => setDraft(d), []);
    const handleImagesChange = useCallback((i: { bannerUrl?: string; iconUrl?: string }) => setImages(i), []);

    const tipKeys = step === 1
        ? ['rooms.create.tips.name', 'rooms.create.tips.categories', 'rooms.create.tips.review']
        : ['rooms.create.tips.banner', 'rooms.create.tips.icon', 'rooms.create.tips.later'];

    return (
        <AuthGuard>
            <div className="relative isolate min-h-screen overflow-hidden bg-background">
                <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[30rem] rounded-full bg-tribe-teal/20 blur-3xl" />

                <div className="mx-auto grid max-w-[1180px] items-start gap-8 px-4 pt-6 pb-16 sm:px-6 md:pt-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
                    {/* LEFT: title + steps + the form, right at the top */}
                    <div className="min-w-0">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <BubbleKicker animated={false} className="mb-3">{t('rooms.create.kicker')}</BubbleKicker>
                                <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                                    {t(createdRoom ? 'rooms.create.title.bring_to_life' : 'rooms.create.title.create_community')}
                                </h1>
                            </div>
                            <Stepper
                                current={step}
                                steps={[t('rooms.create.steps.details'), t('rooms.create.steps.customization')]}
                            />
                        </div>

                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, transform: 'translateY(12px)' }}
                                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                                exit={{ opacity: 0, transform: 'translateY(-8px)' }}
                                transition={{ duration: 0.3, ease: EASE_OUT }}
                            >
                                {createdRoom ? (
                                    <CustomizeRoom room={createdRoom} onImagesChange={handleImagesChange} />
                                ) : (
                                    <CreateRoomForm
                                        onDraftChange={handleDraftChange}
                                        onRoomCreated={(room, d) => { setDraft(d); setCreatedRoom(room); }}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* RIGHT: the brand side */}
                    <aside className="lg:sticky lg:top-8">
                        <div className="relative overflow-hidden rounded-[var(--card-radius)] bg-gradient-to-b from-tribe-teal/15 via-card/60 to-card/40 p-6 ring-1 ring-border/60">
                            <div aria-hidden="true" className="hidden lg:block">
                                <CreateIllustration />
                            </div>

                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground lg:mt-5">
                                {t(createdRoom ? 'rooms.create.subtitle.upload_images' : 'rooms.create.subtitle.configure_space')}
                            </p>

                            <p className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {t('rooms.create.customize.preview')}
                            </p>
                            <TribePreview
                                {...draft}
                                name={createdRoom?.name ?? draft.name}
                                bannerUrl={images.bannerUrl}
                                iconUrl={images.iconUrl}
                            />

                            <ul className="mt-6 space-y-3">
                                {tipKeys.map((key, i) => (
                                    <li key={key} className="flex gap-3 text-sm leading-relaxed">
                                        <span aria-hidden="true" className={cn("mt-1.5 size-2.5 shrink-0 rounded-full rounded-bl-[2px]", TIP_DOTS[i])} />
                                        <span className="text-foreground/85">{t(key)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </AuthGuard>
    );
}

/** Two numbered speech bubbles joined by a line that fills as you advance. */
function Stepper({ current, steps }: { current: number; steps: string[] }) {
    const { t } = useTranslation();
    return (
        <ol aria-label={t('rooms.create.steps.label')} className="flex shrink-0 items-center gap-3">
            {steps.map((label, i) => {
                const n = i + 1;
                const done = n < current;
                const active = n === current;
                return (
                    <li key={label} className="flex items-center gap-3" aria-current={active ? 'step' : undefined}>
                        {i > 0 && (
                            <span aria-hidden="true" className="relative h-0.5 w-8 overflow-hidden rounded-full bg-border">
                                <span className={cn("absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500 ease-out", n <= current ? "w-full" : "w-0")} />
                            </span>
                        )}
                        <span className="flex items-center gap-2">
                            <span className={cn(
                                "flex size-8 items-center justify-center rounded-[12px] rounded-bl-[4px] text-sm font-bold transition-colors duration-300",
                                done && "bg-tribe-teal text-[oklch(0.2_0.04_265)]",
                                active && "bg-primary text-primary-foreground shadow-[var(--btn-primary-shadow)]",
                                !done && !active && "bg-card text-muted-foreground ring-1 ring-border"
                            )}>
                                {done ? <Check className="size-4" strokeWidth={3} /> : n}
                            </span>
                            <span className={cn("text-sm font-semibold", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

/** Buddies gathering under a brand-new tribe icon that's just popped up. */
function CreateIllustration() {
    return (
        <div className="relative mx-auto h-[140px] w-[230px]">
            <div className="brand-anim brand-float absolute left-1/2 top-0 flex size-14 -translate-x-1/2 items-center justify-center rounded-[20px] rounded-tr-[5px] bg-tribe-sun text-2xl font-bold text-[oklch(0.2_0.04_265)] shadow-[0_10px_24px_-10px_var(--shadow-tint)]">
                +
            </div>
            <span className="brand-anim brand-float absolute left-[46px] top-6 size-2.5 rounded-full bg-tribe-coral [animation-delay:0.7s]" />
            <span className="brand-anim brand-float absolute right-[44px] top-10 size-2 rounded-full bg-tribe-violet [animation-delay:1.2s]" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-2">
                <Buddy name="create-coral" tone="coral" size={54} delay={0.2} />
                <Buddy name="create-teal" tone="teal" size={64} delay={0.5} />
                <Buddy name="create-violet" tone="violet" size={50} delay={0.8} />
            </div>
        </div>
    );
}
