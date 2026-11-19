'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/src/components/ui/button';
import { AuthSplitScreen } from '@/src/app/components/auth/AuthSplitScreen';
import { AuthHeading } from '@/src/app/components/auth/AuthFormParts';
import { Buddy } from '@/src/app/components/brand/Buddy';
import { cn } from '@/src/lib/utils';

/** Link failures better-auth reports; anything else falls back to the generic copy. */
const KNOWN_ERRORS = ['TOKEN_EXPIRED', 'INVALID_TOKEN', 'USER_NOT_FOUND', 'INVALID_USER'] as const;

export function VerifyEmailResult({ error }: { error?: string }) {
    const { t } = useTranslation();
    const failed = Boolean(error);
    const errorKey = KNOWN_ERRORS.includes(error as (typeof KNOWN_ERRORS)[number]) ? error : 'GENERIC';

    return (
        <AuthSplitScreen variant={failed ? 'signup' : 'verified'}>
            <div>
                <Badge failed={failed} />

                {failed ? (
                    <AuthHeading
                        title={t('auth.verify.error_title')}
                        subtitle={t(`auth.verify.error.${errorKey}`)}
                    />
                ) : (
                    <AuthHeading
                        title={t('auth.verify.success_title')}
                        subtitle={t('auth.verify.success_message')}
                    />
                )}

                {/* Email verification isn't required to sign in, so even a dead
                    link leads to the same next step. */}
                <div className="mt-8 grid gap-3">
                    <Button asChild size="lg" className="h-12 w-full text-base">
                        <Link href="/login">{t('auth.verify.go_to_login')}</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-12 w-full text-base">
                        <Link href="/tribus">{t('auth.verify.explore')}</Link>
                    </Button>
                </div>
            </div>
        </AuthSplitScreen>
    );
}

/** A Buddy "saying" a check (verified) or a question mark (link problem). */
function Badge({ failed }: { failed: boolean }) {
    return (
        <div aria-hidden="true" className="relative mb-7 h-[104px] w-[150px]">
            <span className={cn(
                "brand-anim brand-float absolute right-0 top-0 flex size-[58px] items-center justify-center rounded-[20px] rounded-bl-[6px] text-[oklch(0.2_0.04_265)]",
                failed ? "bg-tribe-sun" : "bg-tribe-teal"
            )}>
                {failed ? (
                    <span className="text-2xl font-bold">?</span>
                ) : (
                    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                )}
            </span>
            <Buddy name="verify" tone={failed ? 'violet' : 'coral'} size={74} className="absolute bottom-0 left-0" />
        </div>
    );
}
