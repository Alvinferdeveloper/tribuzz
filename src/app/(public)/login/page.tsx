'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from "@/src/components/ui/button";
import { BubbleLoader } from "@/src/components/ui/bubble-loader";
import { authClient } from "@/src/app/lib/auth-client";
import { AuthSplitScreen } from '@/src/app/components/auth/AuthSplitScreen';
import {
  AFTER_AUTH_PATH, AuthDivider, AuthField, AuthHeading, FormAlert, PasswordField,
  SocialAuthButtons, useAuthErrorMessage,
} from '@/src/app/components/auth/AuthFormParts';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const errorMessage = useAuthErrorMessage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setLoading(false);
      setError(errorMessage(error, 'auth.login.error.invalid_credentials'));
      return;
    }
    // Keep the loading state through the navigation.
    router.push(AFTER_AUTH_PATH);
  };

  return (
    <AuthSplitScreen variant="login">
      <div className="space-y-7">
        <AuthHeading title={t('auth.login.title')} subtitle={t('auth.login.subtitle')} />

        <SocialAuthButtons />

        <AuthDivider label={t('auth.login.or_continue_with')} />

        <form onSubmit={handleEmailLogin} className="space-y-4">
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
          <PasswordField
            id="password"
            autoComplete="current-password"
            label={t('auth.login.password_label')}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <FormAlert message={error} />}

          <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={loading}>
            {loading && <BubbleLoader size="sm" mono />}
            {loading ? t('auth.login.loading') : t('auth.login.submit')}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          {t('auth.login.no_account')}{' '}
          <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
            {t('auth.login.signup_link')}
          </Link>
        </p>
      </div>
    </AuthSplitScreen>
  );
}
