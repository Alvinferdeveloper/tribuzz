'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useTranslation } from '@/src/app/lib/i18n';
import { useAuth } from '@/src/app/hooks/useAuth';
import { UserNav } from '@/src/app/components/layout/ProfileDropDown';
import { GlobalSearch } from '@/src/app/components/layout/GlobalSearch';
import { ThemeIconButton } from '@/src/app/components/layout/ThemeIconButton';
import { Button } from '@/src/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/src/components/ui/sheet';
import { APP_NAME } from '@/src/app/constants';
import { cn } from '@/src/lib/utils';

/**
 * Floating pill navbar. Transparent at the top of the page so the landing's
 * background shows through; once you scroll it becomes a glass pill. Guests
 * get the two real next steps (sign in, create an account) instead of a
 * generic login icon; members get their avatar menu.
 */
export default function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { session, isPending } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const isLanding = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { href: '/tribus', label: t('layout.header.nav_explore') },
    ...(isLanding ? [{ href: '/#como-funciona', label: t('layout.header.nav_how') }] : []),
    { href: '/guia-comunidad', label: t('layout.header.nav_community') },
    { href: '/faq', label: t('layout.header.nav_faq') },
  ];
  const isGuest = !isPending && !session?.user;

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-4">
      <div
        className={cn(
          'mx-auto flex h-14 max-w-[1200px] items-center gap-2 rounded-full pl-2 pr-1.5 transition-[background-color,box-shadow] duration-300 ease-out',
          scrolled
            ? 'bg-background/80 shadow-[var(--menu-shadow,0_8px_24px_-12px_rgb(0_0_0/0.2))] ring-1 ring-border/60 backdrop-blur-xl backdrop-saturate-150'
            : 'bg-transparent'
        )}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Image src="/images/logo_chat.png" width={32} height={32} alt="" className="size-8" />
          <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
        </Link>

        <nav aria-label={t('layout.header.nav_label')} className="mx-auto hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-150',
                  active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {/* Search makes sense away from the landing (e.g. profile); the landing pushes to explore. */}
          {!isLanding && (
            <div className="hidden w-56 lg:block">
              <GlobalSearch />
            </div>
          )}
          <ThemeIconButton className="hidden sm:flex" />

          {isGuest ? (
            <>
              <Link
                href="/login"
                className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-accent sm:inline-flex"
              >
                {t('layout.profile_dropdown.login_title')}
              </Link>
              <Button asChild className="h-10 rounded-full px-4">
                <Link href="/signup">{t('layout.header.signup')}</Link>
              </Button>
            </>
          ) : (
            <div className="px-1">
              <UserNav />
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label={t('layout.header.menu')}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent className="w-[280px] p-0">
              <SheetHeader className="border-b p-5 text-left">
                <SheetTitle className="flex items-center gap-2">
                  <Image src="/images/logo_chat.png" width={28} height={28} alt="" />
                  <span>{APP_NAME}</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                      pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                {isGuest && (
                  <Link href="/login" className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground">
                    {t('layout.profile_dropdown.login_title')}
                  </Link>
                )}
                <div className="mt-3 flex items-center justify-between border-t px-4 pt-4">
                  <span className="text-sm font-medium text-muted-foreground">{t('layout.header.theme')}</span>
                  <ThemeIconButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
