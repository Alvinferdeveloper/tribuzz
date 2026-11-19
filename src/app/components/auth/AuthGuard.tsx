"use client";

import { useProtectedRoute } from "@/src/app/hooks/useProtectedRoute";
import { PageLoader } from "@/src/components/ui/bubble-loader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isPending } = useProtectedRoute();

  if (isPending) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
