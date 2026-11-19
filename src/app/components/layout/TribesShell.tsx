'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/src/app/components/layout/ThemeToggle';
import { MoreMenu } from '@/src/app/components/layout/MoreMenu';
import { TribeRail } from '@/src/app/components/layout/TribeRail';
import { MobileTabBar } from '@/src/app/components/layout/MobileTabBar';
import { AuthPromptProvider } from '@/src/app/components/auth/AuthPrompt';
import { APP_NAME } from '@/src/app/constants';
import { cn } from '@/src/lib/utils';

/**
 * Frame for the /tribus pages: the tribe rail on desktop, a bottom tab bar on
 * mobile, and no top navbar (the explore page's hero runs edge to edge).
 * No footer either: these are app screens with infinite scroll, so a footer
 * would be unreachable; its help/legal links live in the "More" menu.
 * The landing keeps its own header via GlobalLayout.
 */
export function TribesShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // On explore, the mobile brand bar floats over the hero illustration.
    const overHero = pathname === '/tribus';

    return (
        <AuthPromptProvider>
            <div className="min-h-dvh md:pl-[80px]">
                <TribeRail />

                <div className={cn(
                    "z-30 flex h-14 items-center justify-between px-4 md:hidden",
                    overHero ? "absolute inset-x-0 top-0 text-white" : "relative"
                )}>
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/images/logo_chat.png" width={28} height={28} alt="" className="size-7" />
                        <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
                    </Link>
                    <div className="flex items-center gap-1">
                        <MoreMenu
                            side="bottom"
                            align="end"
                            className={overHero ? "text-white/85 hover:bg-white/15 hover:text-white data-[state=open]:bg-white/15 data-[state=open]:text-white" : undefined}
                        />
                        <ThemeToggle />
                    </div>
                </div>

                <main className="pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
                    {children}
                </main>

                <MobileTabBar />
            </div>
        </AuthPromptProvider>
    );
}
