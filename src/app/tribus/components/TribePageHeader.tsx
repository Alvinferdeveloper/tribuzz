'use client';

import { motion } from 'framer-motion';
import { BubbleKicker } from '@/src/app/components/brand/BubbleKicker';
import { cn } from '@/src/lib/utils';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

interface TribePageHeaderProps {
    kicker: string;
    title: string;
    subtitle?: string;
    /** Brand illustration on the right (hidden on small screens). */
    illustration?: React.ReactNode;
    /** Controls under the copy: search, tabs, primary action… */
    children?: React.ReactNode;
    /** Logo hue for the soft glow behind the illustration. */
    glow?: 'coral' | 'violet' | 'teal' | 'sun';
    className?: string;
}

const GLOW: Record<NonNullable<TribePageHeaderProps['glow']>, string> = {
    coral: 'bg-tribe-coral/25',
    violet: 'bg-tribe-violet/25',
    teal: 'bg-tribe-teal/25',
    sun: 'bg-tribe-sun/30',
};

/**
 * Top of the /tribus sub-pages (favorites, my tribes, create): the kicker
 * bubble, a big headline and a Buddy illustration on a soft logo-color glow,
 * so every screen of the app opens with the same brand voice as explore.
 */
export function TribePageHeader({ kicker, title, subtitle, illustration, children, glow = 'coral', className }: TribePageHeaderProps) {
    return (
        <header className={cn('relative isolate overflow-hidden', className)}>
            <div aria-hidden="true" className={cn('pointer-events-none absolute -right-24 -top-32 -z-10 size-[26rem] rounded-full blur-3xl', GLOW[glow])} />

            <div className="mx-auto flex w-full max-w-[1400px] items-end justify-between gap-8 px-4 pt-8 pb-6 sm:px-6 md:pt-14">
                <motion.div
                    initial={{ opacity: 0, transform: 'translateY(10px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    transition={{ duration: 0.4, ease: EASE_OUT }}
                    className="min-w-0 max-w-2xl flex-1"
                >
                    <BubbleKicker animated={false} className="mb-4">{kicker}</BubbleKicker>
                    <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">{title}</h1>
                    {subtitle && (
                        <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">{subtitle}</p>
                    )}
                    {children && <div className="mt-7">{children}</div>}
                </motion.div>

                {illustration && (
                    <div aria-hidden="true" className="hidden shrink-0 pb-2 md:block">
                        {illustration}
                    </div>
                )}
            </div>
        </header>
    );
}
