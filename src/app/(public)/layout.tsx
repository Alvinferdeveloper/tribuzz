"use client";

import { GuestGuard } from "@/src/app/components/auth/GuestGuard";
import { AppSurface } from "@/src/app/components/layout/AppSurface";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppSurface>
      <GuestGuard>{children}</GuestGuard>
    </AppSurface>
  );
}
