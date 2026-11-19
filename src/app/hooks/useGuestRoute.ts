"use client";

import { useSession } from "@/src/app/hooks/useSession";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const GUEST_ROUTES = ["/", "/login", "/signup", "/verify-email", "/forgot-password"];

export function useGuestRoute() {
  const { session, isPending, isChecking } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isChecking) return;

    if (session && GUEST_ROUTES.includes(pathname)) {
      router.replace("/tribus");
    }
  }, [session, isChecking, pathname, router]);

  return { isAuthenticated: !!session, isPending };
}
