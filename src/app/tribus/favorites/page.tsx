'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, TriangleAlert } from 'lucide-react';
import useRoom from '@/src/app/tribus/hooks/useRoom';
import { AuthGuard } from "@/src/app/components/auth/AuthGuard";
import { useInfiniteScroll } from '@/src/app/hooks/useInfiniteScroll';
import { RoomCard, roomCardVariants } from '@/src/app/tribus/components/RoomCard';
import { RoomSkeleton } from '@/src/app/tribus/components/RoomSkeleton';
import { useRoomUserCounts } from '@/src/app/tribus/hooks/useRoomUserCounts';
import { SearchBar } from '@/src/app/tribus/components/SearchBar';
import { TribePageHeader } from '@/src/app/tribus/components/TribePageHeader';
import { useDebounce } from '@/src/app/hooks/useDebounce';
import { Buddy } from '@/src/app/components/brand/Buddy';
import { Button } from '@/src/components/ui/button';
import { BubbleLoader } from "@/src/components/ui/bubble-loader";

export default function FavoritesPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [connecting, setConnecting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);

    const { rooms, error, loading, hasMore, loadMoreRooms, retry } = useRoom(debouncedSearch, 'favorites');

    const { sentinelRef } = useInfiniteScroll({ loading, hasMore, onLoadMore: loadMoreRooms });
    const { userCounts } = useRoomUserCounts();

    const handleJoinRoom = (roomId: string) => {
        setConnecting(roomId);
        router.push(`/chat/${roomId}`);
    };

    const showInitialSkeleton = loading && rooms.length === 0;
    const showEmpty = !loading && !error && rooms.length === 0;
    // With no favorites at all, a search field has nothing to search.
    const hasNoFavorites = showEmpty && !debouncedSearch;

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background">
                <TribePageHeader
                    kicker={t('rooms.favorites.kicker')}
                    title={t('rooms.favorites.title')}
                    subtitle={t('rooms.favorites.subtitle')}
                    glow="coral"
                    illustration={<FavoritesIllustration />}
                >
                    {!hasNoFavorites && (
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={t('rooms.favorites.search_placeholder')}
                        />
                    )}
                </TribePageHeader>

                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    {error && rooms.length === 0 ? (
                        <div className="flex flex-col items-center px-4 py-20 text-center">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                                <TriangleAlert className="size-6" />
                            </div>
                            <h2 className="text-lg font-semibold">{t('rooms.error.title')}</h2>
                            <p className="mt-1 mb-6 max-w-md text-sm text-muted-foreground">{error}</p>
                            <Button onClick={retry}>{t('rooms.error.retry')}</Button>
                        </div>
                    ) : hasNoFavorites ? (
                        <EmptyFavorites onBrowse={() => router.push('/tribus')} />
                    ) : (
                        <>
                            <main className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                                {showInitialSkeleton
                                    ? [...Array(4)].map((_, i) => <RoomSkeleton key={i} />)
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
                                <div className="flex flex-col items-center px-4 py-16 text-center">
                                    <p className="max-w-sm text-sm text-muted-foreground">
                                        {t('rooms.favorites.empty_search', { query: searchQuery })}
                                    </p>
                                    <Button variant="outline" className="mt-5" onClick={() => setSearchQuery('')}>
                                        {t('rooms.favorites.clear_search')}
                                    </Button>
                                </div>
                            )}

                            {error && rooms.length > 0 && (
                                <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-destructive/5 p-6 text-center">
                                    <p className="text-sm font-medium text-destructive">{error}</p>
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
                                    <p className="text-sm text-muted-foreground">{t('rooms.favorites.end')}</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}

/** Three Buddies, the middle one in love with a tribe: hearts float up from it. */
function FavoritesIllustration() {
    return (
        <div className="relative h-[150px] w-[230px]">
            <Heart className="brand-anim brand-float absolute left-[104px] top-0 size-9 fill-tribe-coral text-tribe-coral" />
            <Heart className="brand-anim brand-float absolute left-[78px] top-[30px] size-4 fill-tribe-coral/70 text-transparent [animation-delay:0.8s]" />
            <Heart className="brand-anim brand-float absolute left-[150px] top-[22px] size-5 fill-tribe-sun text-transparent [animation-delay:1.4s]" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-2">
                <Buddy name="fav-violet" tone="violet" size={58} delay={0.3} />
                <Buddy name="fav-teal" tone="teal" size={84} />
                <Buddy name="fav-sun" tone="sun" size={52} delay={0.6} />
            </div>
        </div>
    );
}

/** A Buddy "saying" an empty heart: favorites start on a tribe card's heart. */
function EmptyFavorites({ onBrowse }: { onBrowse: () => void }) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center px-4 pt-10 pb-20 text-center">
            <div aria-hidden="true" className="relative mb-6 h-[120px] w-[150px]">
                <div className="absolute right-0 top-0 flex size-[60px] items-center justify-center rounded-[22px] rounded-bl-[6px] border-2 border-dashed border-tribe-coral/60 bg-card">
                    <Heart className="size-6 text-tribe-coral" />
                </div>
                <Buddy name="empty-fav" tone="coral" size={80} className="absolute bottom-0 left-2" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">{t('rooms.favorites.empty_title')}</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {t('rooms.favorites.empty_desc')}
            </p>
            <Button className="mt-6" onClick={onBrowse}>{t('rooms.favorites.browse')}</Button>
        </div>
    );
}
