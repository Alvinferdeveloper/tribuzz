'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NightSky } from '@/src/app/components/brand/NightSky';
import { BubbleKicker } from '@/src/app/components/brand/BubbleKicker';
import { StatusIllustration, type StatusIllustrationVariant } from '@/src/app/components/brand/StatusIllustration';
import { AppSurface } from '@/src/app/components/layout/AppSurface';
import { APP_NAME } from '@/src/app/constants';

interface StatusScreenProps {
    variant: StatusIllustrationVariant;
    kicker: string;
    title: string;
    text: string;
    illustrationLabel: string;
    /** Speech for the lost Buddy (404). */
    speech?: string;
    /** Buttons / links: the way back. */
    actions: React.ReactNode;
    /** Small print under the actions (e.g. an error reference). */
    footnote?: React.ReactNode;
}

/**
 * Full-screen status page (404, errors) set at night, like the auth panel
 * and the chat: always navy in both themes, copy on the left, the scene on
 * the right (stacked on small screens).
 */
export function StatusScreen({ variant, kicker, title, text, illustrationLabel, speech, actions, footnote }: StatusScreenProps) {
    return (
        // Status pages render outside the branded layouts, so opt in here.
        <AppSurface>
            <main className="relative isolate flex min-h-dvh flex-col overflow-hidden text-white">
                <NightSky stars={[80, 34]} fireflies={5} className="-z-10" />

                <header className="px-5 py-5 sm:px-10">
                    <Link href="/" className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                        <Image src="/images/logo_chat.png" width={30} height={30} alt="" className="size-[30px]" />
                        <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
                    </Link>
                </header>

                <div className="mx-auto grid w-full max-w-[1100px] flex-1 items-center gap-6 px-5 pb-12 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
                    <div className="max-w-lg">
                        <BubbleKicker variant="glass" animated={false} className="mb-5">{kicker}</BubbleKicker>
                        <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">{title}</h1>
                        <p className="mt-4 text-base leading-relaxed text-white/75 md:text-lg">{text}</p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>
                        {footnote && <p className="mt-6 text-xs text-white/50">{footnote}</p>}
                    </div>

                    <div className="order-first mx-auto aspect-[440/360] w-full max-w-[300px] sm:max-w-[380px] lg:order-none lg:max-w-[520px]">
                        <StatusIllustration variant={variant} speech={speech} label={illustrationLabel} />
                    </div>
                </div>
            </main>
        </AppSurface>
    );
}

/** Secondary action styled for the night background. */
export const NIGHT_OUTLINE_BUTTON = 'h-12 border-white/25 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white';
