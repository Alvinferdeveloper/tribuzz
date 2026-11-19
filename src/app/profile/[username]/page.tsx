'use client';

import { useParams } from 'next/navigation';
import { UserProfile } from '@/src/app/profile/components/UserProfile';
import { useTranslation } from 'react-i18next';
import { ProfileSkeleton } from "@/src/app/profile/components/ProfileSkeleton";
import { Suspense } from 'react';
import { Button } from '@/src/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OtherProfilePage() {
    const params = useParams();
    const { t } = useTranslation();
    const encodedUsername = params.username as string;
    const username = decodeURIComponent(encodedUsername);
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-[1100px] px-4 pt-4 sm:px-6 md:pt-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" /> {t('profile.public.back')}
                </Button>

                <Suspense fallback={<ProfileSkeleton />}>
                    <UserProfile targetUsername={username} />
                </Suspense>
            </div>
        </div>
    );
}
