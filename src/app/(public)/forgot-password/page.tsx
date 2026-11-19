'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/src/components/ui/button';
import { BubbleLoader } from '@/src/components/ui/bubble-loader';
import { authClient } from '@/src/app/lib/auth-client';
import { AuthSplitScreen } from '@/src/app/components/auth/AuthSplitScreen';
import { AuthBadge } from '@/src/app/components/auth/AuthBadge';
import { AuthField, AuthHeading, FormAlert, useAuthErrorMessage } from '@/src/app/components/auth/AuthFormParts';
import { IconBubbleMail } from '@/src/app/components/brand/icons';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const errorMessage = useAuthErrorMessage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(errorMessage(error, 'auth.forgot.error'));
      return;
    }
    setSentTo(email);
  };

  return (
    <AuthSplitScreen variant="login">
      {sentTo ? (
        <ResetLinkSent email={sentTo} />
      ) : (
        <div className="space-y-7">
          <AuthHeading title={t('auth.forgot.title')} subtitle={t('auth.forgot.subtitle')} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthField
              id="email"
              type="email"
              autoComplete="email"
              label={t('auth.login.email_label')}
              placeholder={t('auth.login.email_placeholder')}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && <FormAlert message={error} />}

            <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={loading}>
              {loading && <BubbleLoader size="sm" mono />}
              {loading ? t('auth.forgot.loading') : t('auth.forgot.submit')}
            </Button>
          </form>

          <BackToLogin />
        </div>
      )}
    </AuthSplitScreen>
  );
}

/** Same copy whether or not the account exists, so the form can't be used to probe emails. */
function ResetLinkSent({ email }: { email: string }) {
  const { t } = useTranslation();
  return (
    <div>
      <AuthBadge bubbleTone="sun" buddyName="inbox" buddyTone="teal">
        <IconBubbleMail className="size-7" />
      </AuthBadge>
      <AuthHeading title={t('auth.forgot.sent_title')} subtitle={t('auth.forgot.sent_message', { email })} />
      <p className="mt-3 text-sm text-muted-foreground">{t('auth.forgot.spam_hint')}</p>
      <Button asChild variant="outline" size="lg" className="mt-7 h-12 w-full text-base">
        <Link href="/login">{t('auth.forgot.back_to_login')}</Link>
      </Button>
    </div>
  );
}

function BackToLogin() {
  const { t } = useTranslation();
  return (
    <p className="text-sm text-muted-foreground">
      {t('auth.forgot.remembered')}{' '}
      <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
        {t('auth.signup.login_link')}
      </Link>
    </p>
  );
}
