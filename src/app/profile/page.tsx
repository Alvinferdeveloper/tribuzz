'use client';

import { AuthGuard } from "@/src/app/components/auth/AuthGuard";
import { UserProfile } from "@/src/app/profile/components/UserProfile";
import { ProfileSkeleton } from "@/src/app/profile/components/ProfileSkeleton";
import { Suspense } from "react";

export default function ProfilePage() {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-main-gradient pb-20">
                <div className="container mx-auto max-w-5xl pt-16 px-4">
                    <Suspense fallback={<ProfileSkeleton />}>
                        <UserProfile />
                    </Suspense>
                </div>
            </div>
        </AuthGuard>
    );
}