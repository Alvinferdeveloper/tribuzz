'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from "@/src/components/ui/button";
import { BubbleLoader } from "@/src/components/ui/bubble-loader";
import { authClient } from '@/src/app/lib/auth-client';
import { AuthSplitScreen } from '@/src/app/components/auth/AuthSplitScreen';
import {
  AFTER_AUTH_PATH, AuthDivider, AuthField, AuthHeading, FormAlert, MIN_PASSWORD_LENGTH, PasswordField,
  SocialAuthButtons, useAuthErrorMessage,
} from '@/src/app/components/auth/AuthFormParts';

export default function SignupPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const errorMessage = useAuthErrorMessage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    if (error) {
      setLoading(false);
      setError(errorMessage(error, 'auth.signup.error.fallback'));
      return;
    }
    // Sign-up signs the user in, so go straight to the app (same as login).
    // Keep the loading state through the navigation.
    router.push(AFTER_AUTH_PATH);
  };

  return (
    <AuthSplitScreen variant="signup">
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
    </AuthSplitScreen>
  );
}
