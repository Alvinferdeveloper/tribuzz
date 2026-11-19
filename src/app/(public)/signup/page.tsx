'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from "@/src/components/ui/button";
import { BubbleLoader } from "@/src/components/ui/bubble-loader";
import { authClient } from '@/src/app/lib/auth-client';
import { AuthSplitScreen } from '@/src/app/components/auth/AuthSplitScreen';
import {
  AuthDivider, AuthField, AuthHeading, FormAlert, PasswordField,
  SocialAuthButtons, useAuthErrorMessage,
} from '@/src/app/components/auth/AuthFormParts';
import { Buddy } from '@/src/app/components/brand/Buddy';
import { IconBubbleMail } from '@/src/app/components/brand/icons';

/** better-auth's default minimum; keep the hint and the input in sync with it. */
const MIN_PASSWORD_LENGTH = 8;

export default function SignupPage() {
  const { t } = useTranslation();
  const errorMessage = useAuthErrorMessage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?success=true`,
    });

    setLoading(false);
    if (error) {
      setError(errorMessage(error, 'auth.signup.error.fallback'));
      return;
    }
    setSentTo(email);
  };

  return (
    <AuthSplitScreen variant="signup">
      {sentTo ? (
        <CheckYourInbox email={sentTo} />
      ) : (
        <div className="space-y-7">
          <AuthHeading title={t('auth.signup.title')} subtitle={t('auth.signup.subtitle')} />

          <SocialAuthButtons />

          <AuthDivider label={t('auth.signup.or_with_email')} />

          <form onSubmit={handleSignup} className="space-y-4">
            <AuthField
              id="name"
              autoComplete="name"
              label={t('auth.signup.name_label')}
              placeholder={t('auth.signup.name_placeholder')}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <AuthField
              id="email"
              type="email"
              autoComplete="email"
              label={t('auth.signup.email_label')}
              placeholder={t('auth.signup.email_placeholder')}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="space-y-1.5">
              <PasswordField
                id="password"
                autoComplete="new-password"
                label={t('auth.signup.password_label')}
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
              {loading ? t('auth.signup.loading') : t('auth.signup.submit')}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            {t('auth.signup.has_account')}{' '}
            <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              {t('auth.signup.login_link')}
            </Link>
          </p>
        </div>
      )}
    </AuthSplitScreen>
  );
}

/** After signing up: a Buddy holding the envelope, and what to do next. */
function CheckYourInbox({ email }: { email: string }) {
  const { t } = useTranslation();
  return (
    <div>
      <div aria-hidden="true" className="relative mb-7 h-[104px] w-[150px]">
        <span className="brand-anim brand-float absolute right-0 top-0 flex size-[58px] items-center justify-center rounded-[20px] rounded-bl-[6px] bg-tribe-sun text-[oklch(0.2_0.04_265)]">
          <IconBubbleMail className="size-7" />
        </span>
        <Buddy name="inbox" tone="teal" size={74} className="absolute bottom-0 left-0" />
      </div>
      <AuthHeading
        title={t('auth.signup.success.title')}
        subtitle={t('auth.signup.success.message', { email })}
      />
      <p className="mt-3 text-sm text-muted-foreground">{t('auth.signup.success.spam_hint')}</p>
      <Button asChild variant="outline" size="lg" className="mt-7 h-12 w-full text-base">
        <Link href="/login">{t('auth.signup.success.go_to_login')}</Link>
      </Button>
    </div>
  );
}
