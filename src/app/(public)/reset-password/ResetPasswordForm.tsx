'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/src/components/ui/button';
import { BubbleLoader } from '@/src/components/ui/bubble-loader';
import { authClient } from '@/src/app/lib/auth-client';
import { AuthSplitScreen } from '@/src/app/components/auth/AuthSplitScreen';
import { AuthBadge, CheckGlyph } from '@/src/app/components/auth/AuthBadge';
import {
    AuthHeading, FormAlert, MIN_PASSWORD_LENGTH, PasswordField, useAuthErrorMessage,
} from '@/src/app/components/auth/AuthFormParts';

type Status = 'form' | 'done' | 'invalid';

/** `token` is missing when better-auth already rejected the link. */
export function ResetPasswordForm({ token }: { token?: string }) {
    const { t } = useTranslation();
    const errorMessage = useAuthErrorMessage();
    const [status, setStatus] = useState<Status>(token ? 'form' : 'invalid');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setLoading(true);
        setError(null);

        const { error } = await authClient.resetPassword({ newPassword: password, token });

        setLoading(false);
        if (error?.code === 'INVALID_TOKEN') {
            setStatus('invalid');
            return;
        }
        if (error) {
            setError(errorMessage(error, 'auth.reset.error'));
            return;
        }
        setStatus('done');
    };

    return (
        <AuthSplitScreen variant={status === 'done' ? 'verified' : 'login'}>
            {status === 'invalid' && <InvalidLink />}
            {status === 'done' && <PasswordUpdated />}
            {status === 'form' && (
                <div className="space-y-7">
                    <AuthHeading title={t('auth.reset.title')} subtitle={t('auth.reset.subtitle')} />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <PasswordField
                                id="new-password"
                                autoComplete="new-password"
                                label={t('auth.reset.password_label')}
                                required
                                minLength={MIN_PASSWORD_LENGTH}
                                aria-describedby="password-hint"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p id="password-hint" className="text-xs text-muted-foreground">
                                {t('auth.signup.password_hint', { count: MIN_PASSWORD_LENGTH })}
                            </p>
                        </div>

                        {error && <FormAlert message={error} />}

                        <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={loading}>
                            {loading && <BubbleLoader size="sm" mono />}
                            {loading ? t('auth.reset.loading') : t('auth.reset.submit')}
                        </Button>
                    </form>
                </div>
            )}
        </AuthSplitScreen>
    );
}

function PasswordUpdated() {
    const { t } = useTranslation();
    return (
        <div>
            <AuthBadge bubbleTone="teal" buddyName="verify" buddyTone="coral">
                <CheckGlyph />
            </AuthBadge>
            <AuthHeading title={t('auth.reset.done_title')} subtitle={t('auth.reset.done_message')} />
            <Button asChild size="lg" className="mt-8 h-12 w-full text-base">
                <Link href="/login">{t('auth.verify.go_to_login')}</Link>
            </Button>
        </div>
    );
}

function InvalidLink() {
    const { t } = useTranslation();
    return (
        <div>
            <AuthBadge bubbleTone="sun" buddyName="verify" buddyTone="violet">
                <span className="text-2xl font-bold">?</span>
            </AuthBadge>
            <AuthHeading title={t('auth.verify.error_title')} subtitle={t('auth.reset.invalid_message')} />
            <Button asChild size="lg" className="mt-8 h-12 w-full text-base">
                <Link href="/forgot-password">{t('auth.reset.request_new')}</Link>
            </Button>
        </div>
    );
}
