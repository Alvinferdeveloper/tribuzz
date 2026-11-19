'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormProvider } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { BubbleLoader } from '@/src/components/ui/bubble-loader';
import { useProfileSetup } from '@/src/app/hooks/useProfileSetup';
import { ProfileFormValues } from '@/src/lib/validators/user';
import { StepIdentity, StepHobbies, StepConversation } from './form/OnboardingSteps';
import { OnboardingStage, OnboardingWelcome, OnboardingDone } from './form/OnboardingStage';
import { cn } from '@/src/lib/utils';

interface AdditionalInfoModalProps {
    isOpen: boolean;
    onProfileComplete: () => void;
    onClose?: () => void;
}

export type OnboardingStep = 'welcome' | 'identity' | 'hobbies' | 'conversation' | 'done';

/** The question steps, in order, with the fields each one must pass before moving on. */
const QUESTION_STEPS: { id: OnboardingStep; fields: (keyof ProfileFormValues)[] }[] = [
    { id: 'identity', fields: ['username', 'age', 'location'] },
    { id: 'hobbies', fields: ['selectedHobbies'] },
    { id: 'conversation', fields: ['conversationType', 'bio'] },
];

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * Onboarding shown on first visit until the profile is complete: a welcome,
 * three short questions (one per screen) and a small celebration. The brand
 * panel keeps the person's own Buddy on screen, reacting to each answer and
 * building a preview of their profile as they go. Full screen on phones,
 * split dialog on larger screens.
 */
export function AdditionalInfoModal({ isOpen, onProfileComplete, onClose }: AdditionalInfoModalProps) {
    const { t } = useTranslation();
    const { form, hobbies, hobbiesLoading, error, handleSubmit } = useProfileSetup();
    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [direction, setDirection] = useState(1);

    const questionIndex = QUESTION_STEPS.findIndex(s => s.id === step);
    const isQuestion = questionIndex >= 0;
    const isLastQuestion = questionIndex === QUESTION_STEPS.length - 1;
    const submitting = form.formState.isSubmitting;

    const goTo = (next: OnboardingStep, dir: 1 | -1) => {
        setDirection(dir);
        setStep(next);
    };

    const save = form.handleSubmit(async (values) => {
        const code = await handleSubmit(values, () => goTo('done', 1));
        if (code === 'USERNAME_TAKEN') {
            goTo('identity', -1);
            form.setError('username', { message: t('USERNAME_TAKEN') });
        }
    });

    const next = async () => {
        if (step === 'welcome') return goTo('identity', 1);
        if (!isQuestion) return;
        const valid = await form.trigger(QUESTION_STEPS[questionIndex].fields);
        if (!valid) return;
        if (isLastQuestion) return save();
        goTo(QUESTION_STEPS[questionIndex + 1].id, 1);
    };

    const back = () => {
        if (questionIndex > 0) goTo(QUESTION_STEPS[questionIndex - 1].id, -1);
        else goTo('welcome', -1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose?.(); }}>
            <DialogContent
                showCloseButton={Boolean(onClose)}
                className={cn(
                    'grid h-dvh w-screen max-w-none gap-0 overflow-hidden rounded-none border-0 p-0',
                    'grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[340px_minmax(0,1fr)] md:grid-rows-1',
                    'sm:h-[min(700px,94dvh)] sm:w-[min(940px,calc(100vw-2rem))] sm:max-w-none sm:rounded-[var(--dialog-radius)] sm:border'
                )}
            >
                <DialogTitle className="sr-only">{t('onboarding.dialog_title')}</DialogTitle>
                <DialogDescription className="sr-only">{t('onboarding.dialog_description')}</DialogDescription>

                <FormProvider {...form}>
                    <OnboardingStage step={step} hobbies={hobbies} />

                    <form
                        onSubmit={(e) => { e.preventDefault(); next(); }}
                        className="flex min-h-0 flex-col"
                    >
                        {isQuestion && <Progress current={questionIndex} total={QUESTION_STEPS.length} />}

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
                            <AnimatePresence mode="wait" initial={false} custom={direction}>
                                <motion.div
                                    key={step}
                                    custom={direction}
                                    initial={{ opacity: 0, transform: `translateX(${direction * 20}px)` }}
                                    animate={{ opacity: 1, transform: 'translateX(0px)' }}
                                    exit={{ opacity: 0, transform: `translateX(${direction * -20}px)` }}
                                    transition={{ duration: 0.22, ease: EASE_OUT }}
                                >
                                    {step === 'welcome' && <OnboardingWelcome />}
                                    {step === 'identity' && <StepIdentity />}
                                    {step === 'hobbies' && <StepHobbies hobbies={hobbies} loading={hobbiesLoading} />}
                                    {step === 'conversation' && <StepConversation />}
                                    {step === 'done' && <OnboardingDone />}
                                </motion.div>
                            </AnimatePresence>

                            {error && isQuestion && error !== 'USERNAME_TAKEN' && (
                                <p role="alert" className="mt-6 rounded-[10px] bg-destructive/10 p-3 text-sm font-medium text-destructive">
                                    {t(error)}
                                </p>
                            )}
                        </div>

                        <footer className="flex shrink-0 items-center gap-3 border-t border-border px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:px-8">
                            {isQuestion && (
                                <Button type="button" variant="ghost" size="lg" onClick={back} disabled={submitting} className="h-12 px-4">
                                    <ArrowLeft className="size-4" />
                                    {t('onboarding.back')}
                                </Button>
                            )}
                            {step === 'done' ? (
                                <Button type="button" size="lg" onClick={onProfileComplete} className="ml-auto h-12 min-w-[180px] text-base">
                                    {t('onboarding.done.cta')}
                                    <ArrowRight className="size-4" />
                                </Button>
                            ) : (
                                <Button type="submit" size="lg" disabled={submitting} className="ml-auto h-12 min-w-[160px] text-base">
                                    {submitting && <BubbleLoader size="sm" mono />}
                                    {step === 'welcome'
                                        ? t('onboarding.start')
                                        : isLastQuestion
                                            ? (submitting ? t('onboarding.saving') : t('onboarding.finish'))
                                            : t('onboarding.next')}
                                    {!submitting && <ArrowRight className="size-4" />}
                                </Button>
                            )}
                        </footer>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}

/** "Step 2 of 3" with a segmented bar. */
function Progress({ current, total }: { current: number; total: number }) {
    const { t } = useTranslation();
    return (
        <div className="shrink-0 px-5 pt-5 sm:px-8 sm:pt-7">
            <p className="text-xs font-semibold text-muted-foreground">{t('onboarding.progress', { current: current + 1, total })}</p>
            <div className="mt-2 flex gap-1.5" aria-hidden="true">
                {Array.from({ length: total }, (_, i) => (
                    <span key={i} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <span className={cn('absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-300 ease-out', i <= current ? 'w-full' : 'w-0')} />
                    </span>
                ))}
            </div>
        </div>
    );
}
