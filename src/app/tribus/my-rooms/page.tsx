'use client';

import { AuthGuard } from "@/src/app/components/auth/AuthGuard";
import { useTranslation } from 'react-i18next';
import { useMyRooms } from '@/src/app/tribus/my-rooms/hooks/useMyRooms';
import { RoomCard, roomCardVariants } from '@/src/app/tribus/components/RoomCard';
import { Plus, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRoomUserCounts } from '@/src/app/tribus/hooks/useRoomUserCounts';
import { useInfiniteScroll } from '@/src/app/hooks/useInfiniteScroll';
import RoomCardFooter, { ROOM_STATUS_TONE } from '@/src/app/tribus/my-rooms/components/RoomCardFooter';
import { RoomStatus } from '@/src/app/tribus/hooks/useRoom';
import { cn } from '@/src/lib/utils';
import { BubbleLoader } from "@/src/components/ui/bubble-loader";
import { RoomSkeleton } from '@/src/app/tribus/components/RoomSkeleton';
import { TribePageHeader } from '@/src/app/tribus/components/TribePageHeader';
import { Buddy } from '@/src/app/components/brand/Buddy';
import { Button } from '@/src/components/ui/button';

type StatusTab = RoomStatus | 'ALL';
const STATUS_TABS: StatusTab[] = ['ALL', 'IN_REVISION', 'ACCEPTED', 'REJECTED'];

const TAB_LABEL: Record<StatusTab, string> = {
    ALL: 'rooms.my-rooms.tabs.all',
    IN_REVISION: 'rooms.my-rooms.tabs.in_revision',
    ACCEPTED: 'rooms.my-rooms.tabs.accepted',
    REJECTED: 'rooms.my-rooms.tabs.rejected',
};

export default function MyRoomsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [connecting, setConnecting] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<StatusTab>('ALL');
    const { userCounts } = useRoomUserCounts();
    const { rooms, loading, error, retry, hasMore, loadMoreRooms, deleteRoom, updateRoom, updateCategories } = useMyRooms(activeTab);

    const { sentinelRef } = useInfiniteScroll({ loading, hasMore, onLoadMore: loadMoreRooms });

    // Only accepted tribes have a chat to open; the server would turn the
    // others away, so explain why instead of navigating to an error.
    const handleJoinRoom = (roomId: string) => {
        const room = rooms.find(r => r.id === roomId);
        if (room && room.status !== 'ACCEPTED') {
            toast.info(t(room.status === 'IN_REVISION' ? 'rooms.my-rooms.not_open_revision' : 'rooms.my-rooms.not_open_rejected'));
            return;
        }
        setConnecting(roomId);
        router.push(`/chat/${roomId}`);
    };

    const emptyKey = activeTab === 'ALL' ? 'empty_all' : `empty_${activeTab.toLowerCase()}`;
    const showInitialSkeleton = loading && rooms.length === 0;
    const showEmpty = !loading && !error && rooms.length === 0;
    const errorText = error ? t(error, { defaultValue: t('MY_ROOMS_LOAD_ERROR') }) : '';

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background">
                <TribePageHeader
                    kicker={t('rooms.my-rooms.kicker')}
                    title={t('rooms.my-rooms.title')}
                    subtitle={t('rooms.my-rooms.subtitle')}
                    glow="violet"
                    illustration={<MyTribesIllustration />}
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div role="tablist" aria-label={t('rooms.my-rooms.title')} className="chip-rail -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0">
                            {STATUS_TABS.map(tab => {
                                const active = activeTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold",
                                            "transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.97]",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                                            active
                                                ? "bg-foreground text-background shadow-[0_4px_12px_-6px_var(--shadow-tint)]"
                                                : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground hover:ring-muted-foreground/40"
                                        )}
                                    >
                                        {tab !== 'ALL' && (
                                            <span aria-hidden="true" className={cn("size-2 rounded-full", ROOM_STATUS_TONE[tab].dot)} />
                                        )}
                                        {t(TAB_LABEL[tab])}
                                    </button>
                                );
                            })}
                        </div>

                        <Button asChild className="shrink-0 self-start sm:self-auto">
                            <Link href="/tribus/create">
                                <Plus className="size-4" />
                                {t('rooms.my-rooms.create_new')}
                            </Link>
                        </Button>
                    </div>
                </TribePageHeader>

                <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                    {error && rooms.length === 0 ? (
                        <div className="flex flex-col items-center px-4 py-20 text-center">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                                <TriangleAlert className="size-6" />
                            </div>
                            <h2 className="text-lg font-semibold">{t('rooms.error.title')}</h2>
                            <p className="mt-1 mb-6 max-w-md text-sm text-muted-foreground">{errorText}</p>
                            <Button onClick={retry}>{t('rooms.error.retry')}</Button>
                        </div>
                    ) : showEmpty ? (
                        <EmptyMyTribes
                            title={t(`rooms.my-rooms.${emptyKey}_title`)}
                            description={t(`rooms.my-rooms.${emptyKey}_desc`)}
                            tab={activeTab}
                        />
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
                                            onDelete={deleteRoom}
                                            onUpdate={updateRoom}
                                            onUpdateCategories={updateCategories}
                                            cardVariants={roomCardVariants}
                                            footer={<RoomCardFooter room={room} />}
                                        />
                                    ))}
                            </main>

                            {error && rooms.length > 0 && (
                                <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-destructive/5 p-6 text-center">
                                    <p className="text-sm font-medium text-destructive">{errorText}</p>
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
                                    <p className="text-sm text-muted-foreground">{t('rooms.my-rooms.end')}</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}

/** A Buddy proudly next to the tribes it built: stacked tribe icons in the logo hues. */
function MyTribesIllustration() {
    return (
        <div className="relative h-[150px] w-[230px]">
            <div className="absolute bottom-0 left-[18px] flex flex-col items-center gap-1.5">
                <div className="brand-anim brand-float size-11 rounded-[16px] rounded-tr-[4px] bg-tribe-sun [animation-delay:0.6s]" />
                <div className="flex gap-1.5">
                    <div className="size-12 rounded-[17px] rounded-tl-[4px] bg-tribe-teal" />
                    <div className="size-12 rounded-[17px] rounded-br-[4px] bg-tribe-violet" />
                </div>
            </div>
            <Buddy name="my-tribes" tone="coral" size={92} className="absolute bottom-0 right-[14px]" />
        </div>
    );
}

/** Empty tab: a Buddy beside a dashed "tribe to be" (with a create CTA on "All"). */
function EmptyMyTribes({ title, description, tab }: { title: string; description: string; tab: StatusTab }) {
    const { t } = useTranslation();
    const tone = tab === 'IN_REVISION' ? 'sun' : tab === 'REJECTED' ? 'violet' : 'teal';
    return (
        <div className="flex flex-col items-center px-4 pt-10 pb-20 text-center">
            <div aria-hidden="true" className="relative mb-6 h-[110px] w-[160px]">
                <div className="absolute right-0 top-0 flex size-[64px] items-center justify-center rounded-[22px] rounded-bl-[6px] border-2 border-dashed border-muted-foreground/40 bg-card text-muted-foreground">
                    <Plus className="size-6" />
                </div>
                <Buddy name={`empty-${tab}`} tone={tone} size={76} className="absolute bottom-0 left-2" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
            {tab === 'ALL' && (
                <Button asChild className="mt-6">
                    <Link href="/tribus/create">
                        <Plus className="size-4" />
                        {t('rooms.my-rooms.create_first')}
                    </Link>
                </Button>
            )}
        </div>
    );
}
