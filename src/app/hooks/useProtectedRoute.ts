"use client";

import { useSession } from "@/src/app/hooks/useSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useProtectedRoute() {
  const { session, isPending, isChecking } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Wait for any session check (e.g. right after signing in) before
    // deciding there's no session.
    if (isChecking) return;
    if (!session) {
      router.replace("/login");
    }
  }, [session, isChecking, router]);

  return { isAuthenticated: !!session, isPending };
}
