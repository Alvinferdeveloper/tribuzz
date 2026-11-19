import { redirect } from 'next/navigation';
import { Metadata } from "next";
import { VerifyEmailResult } from './VerifyEmailResult';

export const metadata: Metadata = {
    title: "Verificación de Correo",
    description: "Confirma tu dirección de correo electrónico para activar tu cuenta.",
    robots: {
        index: false,
        follow: true,
    },
};

/**
 * Landing spot of the verification link. better-auth redirects here with
 * `?success=true` (our callbackURL) and, when the link failed, appends
 * `&error=<CODE>` (TOKEN_EXPIRED, INVALID_TOKEN, USER_NOT_FOUND…).
 */
export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const error = typeof params.error === 'string' ? params.error : undefined;
    if (params.success !== 'true' && !error) redirect('/login');

    return <VerifyEmailResult error={error} />;
}
