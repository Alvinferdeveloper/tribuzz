"use client";

import { useGuestRoute } from "@/src/app/hooks/useGuestRoute";
import { PageLoader } from "@/src/components/ui/bubble-loader";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isPending } = useGuestRoute();

  if (isPending) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
