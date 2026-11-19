import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata: Metadata = {
    title: 'Nueva contraseña',
    description: 'Elige una nueva contraseña para tu cuenta.',
    robots: {
        index: false,
        follow: false,
    },
};

/**
 * Landing spot of the reset link. better-auth validates the token and
 * redirects here with `?token=<TOKEN>`, or with `?error=INVALID_TOKEN`
 * when the link expired or was already used.
 */
export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const token = typeof params.token === 'string' ? params.token : undefined;
    const error = typeof params.error === 'string' ? params.error : undefined;
    if (!token && !error) redirect('/forgot-password');

    return <ResetPasswordForm token={token} />;
}
