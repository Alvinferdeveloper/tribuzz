'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, CircleAlert } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { authClient } from '@/src/app/lib/auth-client';
import { cn } from '@/src/lib/utils';
import Google from '@/src/app/components/svg/logos/Google';
import Facebook from '@/src/app/components/svg/logos/Facebook';

/**
 * Pieces shared by the login and signup forms, so both screens stay
 * identical in look and behavior and each page only holds its own logic.
 */

const AFTER_AUTH_PATH = '/tribus';

/** better-auth's default minimum; keep hints and inputs in sync with it. */
export const MIN_PASSWORD_LENGTH = 8;

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-balance text-[1.75rem] font-bold leading-tight tracking-tight">{title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p>
    </div>
  );
}

type SocialProvider = 'google' | 'facebook';

const PROVIDERS: { id: SocialProvider; Logo: () => React.JSX.Element }[] = [
  { id: 'google', Logo: Google },
  { id: 'facebook', Logo: Facebook },
];

/** "Continue with …" buttons. Social sign-in creates the account if needed, so login and signup share them. */
export function SocialAuthButtons() {
  const { t } = useTranslation();
  const [pending, setPending] = useState<SocialProvider | null>(null);

  const signIn = async (provider: SocialProvider) => {
    setPending(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}${AFTER_AUTH_PATH}`,
      });
    } finally {
      // On success the browser navigates away; this only matters on failure.
      setPending(null);
    }
  };

  return (
    <div className="grid gap-2.5">
      {PROVIDERS.map(({ id, Logo }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          disabled={pending !== null}
          onClick={() => signIn(id)}
          className="h-11 w-full justify-center gap-2.5 bg-card text-[15px] font-semibold [&_svg]:size-[18px]"
        >
          <Logo />
          {t(`auth.social.${id}`)}
        </Button>
      ))}
    </div>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

interface TextFieldProps extends Omit<React.ComponentProps<'input'>, 'id'> {
  id: string;
  label: string;
  /** Right side of the label row (e.g. a "forgot password?" link). */
  labelAside?: React.ReactNode;
}

export function AuthField({ id, label, labelAside, className, ...inputProps }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-semibold">{label}</Label>
        {labelAside}
      </div>
      <Input id={id} className={cn('h-11', className)} {...inputProps} />
    </div>
  );
}

/** Password input with a show/hide toggle, so people can check what they typed. */
export function PasswordField({ id, label, labelAside, className, ...inputProps }: Omit<TextFieldProps, 'type'>) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-semibold">{label}</Label>
        {labelAside}
      </div>
      <div className="relative">
        <Input
          {...inputProps}
          id={id}
          type={visible ? 'text' : 'password'}
          className={cn('h-11 pr-11', className)}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={t(visible ? 'auth.password.hide' : 'auth.password.show')}
          aria-pressed={visible}
          className="absolute inset-y-0 right-1 my-auto flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}

export function FormAlert({ message }: { message: string }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-[10px] bg-destructive/10 p-3 text-sm font-medium text-destructive">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

/**
 * better-auth errors come with a stable `code` (e.g. INVALID_EMAIL_OR_PASSWORD)
 * and an English `message`. Show our translation for known codes.
 */
export function useAuthErrorMessage() {
  const { t } = useTranslation();
  return (error: { code?: string; status?: number; message?: string } | null | undefined, fallbackKey: string) => {
    if (!error) return null;
    if (error.status === 403) return t('auth.errors.EMAIL_NOT_VERIFIED');
    if (error.status === 429) return t('auth.errors.TOO_MANY_REQUESTS');
    return t(`auth.errors.${error.code ?? 'UNKNOWN'}`, { defaultValue: t(fallbackKey) });
  };
}

export { AFTER_AUTH_PATH };
