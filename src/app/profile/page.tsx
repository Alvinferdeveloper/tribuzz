'use client';

import { AuthGuard } from "@/src/app/components/auth/AuthGuard";
import { UserProfile } from "@/src/app/profile/components/UserProfile";
import { ProfileSkeleton } from "@/src/app/profile/components/ProfileSkeleton";
import { Suspense } from "react";

export default function ProfilePage() {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-[1100px] px-4 pt-6 sm:px-6 md:pt-10">
                    <Suspense fallback={<ProfileSkeleton />}>
                        <UserProfile />
                    </Suspense>
                </div>
            </div>
        </AuthGuard>
    );
}