'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/src/app/components/layout/ThemeToggle';
import { NightSky } from '@/src/app/components/brand/NightSky';
import { BubbleKicker } from '@/src/app/components/brand/BubbleKicker';
import { AuthIllustration, type AuthIllustrationVariant } from '@/src/app/components/brand/AuthIllustration';
import { APP_NAME } from '@/src/app/constants';

interface AuthSplitScreenProps {
  children: ReactNode;
  /** Which story the brand panel tells (and how the tribe greets you). */
  variant: AuthIllustrationVariant;
}

/**
 * Frame for the auth screens. Left: the form, on the app surface (follows
 * the theme). Right, desktop only: the brand panel, always night navy, with
 * the tribe-around-the-fire illustration.
 */
export function AuthSplitScreen({ children, variant }: AuthSplitScreenProps) {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-dvh bg-background text-foreground">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
            <Image src="/images/logo_chat.png" width={30} height={30} alt="" priority className="size-[30px]" />
            <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
          </Link>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[380px]">{children}</div>
        </div>
      </section>

      <aside className="relative hidden w-[min(46vw,640px)] shrink-0 overflow-hidden text-white lg:flex lg:flex-col">
        <NightSky stars={[70, 30]} fireflies={6} />

        <div className="relative px-12 pt-14 xl:px-16">
          <BubbleKicker variant="glass" animated={false}>{t('auth.showcase.kicker')}</BubbleKicker>
          <h2 className="mt-5 max-w-md text-balance text-4xl font-bold leading-[1.08] tracking-tight xl:text-[2.75rem]">
            {t('auth.showcase.title_before')}{' '}
            <span className="text-tribe-sun">{t('auth.showcase.title_highlight')}</span>
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/70">{t('auth.showcase.subtitle')}</p>
        </div>

        <div className="relative mt-auto px-6 pb-6 xl:px-10">
          <div className="mx-auto aspect-[520/440] w-full max-w-[560px]">
            <AuthIllustration
              variant={variant}
              greeting={t(`auth.showcase.greeting_${variant}`)}
              label={t('auth.showcase.illustration_label')}
            />
          </div>
        </div>
      </aside>
    </main>
  );
}
