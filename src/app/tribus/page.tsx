'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useRoom from '@/src/app/tribus/hooks/useRoom';
import { AdditionalInfoModal } from '@/src/app/components/auth/AdditionalInfoModal';
import { useAuth } from '@/src/app/hooks/useAuth';
import { useInfiniteScroll } from '@/src/app/hooks/useInfiniteScroll';
import { motion } from 'framer-motion';
import { RoomCard, roomCardVariants } from '@/src/app/tribus/components/RoomCard';
import { RoomSkeleton } from '@/src/app/tribus/components/RoomSkeleton';
import { useCategories } from '@/src/app/tribus/create/hooks/useCategories';
import { useRoomUserCounts } from '@/src/app/tribus/hooks/useRoomUserCounts';
import { useDebounce } from '@/src/app/hooks/useDebounce';
import { Search, X, TriangleAlert, Compass } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { BubbleKicker } from '@/src/app/components/brand/BubbleKicker';
import { TopicChip } from '@/src/app/tribus/components/TopicChip';
import { APP_NAME } from '@/src/app/constants';
import { BubbleLoader } from "@/src/components/ui/bubble-loader";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export default function Rooms() {
    const { t } = useTranslation();
    const router = useRouter();
    const [connecting, setConnecting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const { rooms, error, loading, hasMore, loadMoreRooms, retry } = useRoom(debouncedSearch);

    const { sentinelRef } = useInfiniteScroll({ loading, hasMore, onLoadMore: loadMoreRooms });
    const { userCounts } = useRoomUserCounts();
    const { categories } = useCategories();

    const { session, isPending } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isCompleteProfile = (session?.user as any)?.isCompleteProfile ?? true;

    useEffect(() => {
        if (isPending) return;
        if (session?.user && !isCompleteProfile) {
            setIsModalOpen(true);
        }
    }, [isPending, isCompleteProfile, session?.user]);

    // "/" focuses search, the same shortcut people know from GitHub, Slack, etc.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
            const target = e.target as HTMLElement | null;
            if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
            e.preventDefault();
            searchInputRef.current?.focus();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    const handleProfileComplete = () => {
        setIsModalOpen(false);
        window.location.reload();
    };

    const handleJoinRoom = (roomId: string) => {
        setConnecting(roomId);
        router.push(`/chat/${roomId}`);
    };

    const toggleCategory = (name: string) => {
        setSearchQuery(current => current.trim().toLowerCase() === name.toLowerCase() ? '' : name);
    };

    const activeQuery = searchQuery.trim().toLowerCase();
    const showInitialSkeleton = loading && rooms.length === 0;
    const showEmpty = !loading && !error && rooms.length === 0;

    return (
        <div className="min-h-screen bg-background">
            <AdditionalInfoModal
                isOpen={isModalOpen}
                onProfileComplete={handleProfileComplete}
            />

            {/* HERO: the illustration is the brand moment of this page; the
                content sits left on a scrim so it stays legible, and the bottom
                melts into the page background instead of ending on a hard edge. */}
            <section className="relative isolate w-full overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <img
                        src="/illustrations/room_background.jpg"
                        alt=""
                        className="h-full w-full object-cover object-[60%_center]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.18_0.03_40/0.78)] via-[oklch(0.18_0.03_40/0.45)] to-[oklch(0.18_0.03_40/0.05)]" />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
                </div>

                <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 pt-14 pb-20 md:pt-24 md:pb-28">
                    <motion.div
                        initial={{ opacity: 0, transform: 'translateY(12px)' }}
                        animate={{ opacity: 1, transform: 'translateY(0px)' }}
                        transition={{ duration: 0.45, ease: EASE_OUT }}
                        className="max-w-xl"
                    >
                        <BubbleKicker variant="glass" animated={false} className="mb-4">{t('rooms.hero.badge')}</BubbleKicker>

                        <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
                            {t('rooms.hero.title').split(APP_NAME).map((part, i, arr) => (
                                <span key={i}>
                                    {part}
                                    {i < arr.length - 1 && <span className="text-tribe-sun">{APP_NAME}</span>}
                                </span>
                            ))}
                        </h1>

                        <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
                            {t('rooms.hero.subtitle')}
                        </p>

                        {/* Solid field, not frosted glass: it has to read instantly
                            over a busy illustration in both themes. */}
                        <label className="group mt-8 flex h-14 w-full items-center gap-3 rounded-2xl bg-card px-4 text-card-foreground shadow-[0_12px_32px_-12px_oklch(0.12_0.04_265/0.55)] ring-1 ring-black/5 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary/60">
                            <Search className="size-5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <span className="sr-only">{t('rooms.search.placeholder')}</span>
                            <input
                                ref={searchInputRef}
                                type="search"
                                className="h-full w-full bg-transparent text-base outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
                                placeholder={t('rooms.search.placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-150 hover:bg-accent hover:text-foreground active:scale-95"
                                    aria-label={t('rooms.search.clear')}
                                >
                                    <X className="size-4" />
                                </button>
                            ) : (
                                <kbd className="hidden h-6 min-w-6 items-center justify-center rounded-md border border-border px-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex">
                                    /
                                </kbd>
                            )}
                        </label>
                    </motion.div>
                </div>
            </section>

            <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 -mt-4">
                {/* Category rail: always visible (it used to appear only while the
                    search was focused, so most people never saw it). */}
                {categories.length > 0 && (
                    <nav aria-label={t('rooms.search.suggestions')} className="chip-rail -mx-4 flex gap-2 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0">
                        <TopicChip
                            label={t('rooms.filter.all')}
                            withBadge={false}
                            active={activeQuery === ''}
                            onClick={() => setSearchQuery('')}
                        />
                        {categories.map(category => (
                            <TopicChip
                                key={category.id}
                                label={category.name}
                                icon={category.icon}
                                active={activeQuery === category.name.toLowerCase()}
                                onClick={() => toggleCategory(category.name)}
                            />
                        ))}
                    </nav>
                )}

                {error && rooms.length === 0 ? (
                    <div className="flex flex-col items-center px-4 py-20 text-center">
                        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                            <TriangleAlert className="size-6" />
                        </div>
                        <h2 className="text-lg font-semibold">{t('rooms.error.title')}</h2>
                        <p className="mt-1 mb-6 max-w-md text-sm text-muted-foreground">{t(error, { defaultValue: t('ROOMS_GENERIC_ERROR') })}</p>
                        <Button onClick={retry}>{t('rooms.error.retry')}</Button>
                    </div>
                ) : (
                    <>
                        <main className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                            {showInitialSkeleton
                                ? [...Array(8)].map((_, i) => <RoomSkeleton key={i} />)
                                : rooms.map((room, index) => (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        index={index}
                                        userCount={userCounts[room.id] || 0}
                                        isConnecting={connecting === room.id}
                                        onJoin={handleJoinRoom}
                                        cardVariants={roomCardVariants}
                                    />
                                ))}
                        </main>

                        {showEmpty && (
                            <div className="flex flex-col items-center px-4 py-20 text-center">
                                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-tribe-teal/20 text-tribe-teal-ink">
                                    <Compass className="size-6" />
                                </div>
                                <h2 className="text-lg font-semibold">{t('rooms.empty.title')}</h2>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    {searchQuery ? t('rooms.empty.search', { query: searchQuery }) : t('rooms.empty.subtitle')}
                                </p>
                                {searchQuery && (
                                    <Button variant="outline" className="mt-6" onClick={() => setSearchQuery('')}>
                                        {t('rooms.empty.clear')}
                                    </Button>
                                )}
                            </div>
                        )}

                        {error && rooms.length > 0 && (
                            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-destructive/5 p-6 text-center">
                                <p className="text-sm font-medium text-destructive">{t(error, { defaultValue: t('ROOMS_GENERIC_ERROR') })}</p>
                                <Button variant="outline" size="sm" onClick={retry}>
                                    {t('rooms.load_more.retry')}
                                </Button>
                            </div>
                        )}

                        <div ref={sentinelRef} className="flex h-24 items-center justify-center">
                            {loading && rooms.length > 0 && (
                                <BubbleLoader size="md" label={t('rooms.load_more.loading')} />
                            )}
                            {!loading && !hasMore && rooms.length > 0 && (
                                <p className="text-sm text-muted-foreground">{t('rooms.load_more.no_more')}</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
