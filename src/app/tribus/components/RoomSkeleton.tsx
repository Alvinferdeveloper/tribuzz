// Mirrors RoomCard's geometry exactly (banner height, squircle icon offset,
// text rows) so content replaces it without the grid shifting.
export function RoomSkeleton() {
    return (
        <div aria-hidden="true" className="flex h-full flex-col overflow-hidden rounded-[10px] bg-card ring-1 ring-border/70">
            <div className="relative shrink-0">
                <div className="h-[124px] w-full animate-pulse bg-muted" />
                <div className="absolute -bottom-5 left-4">
                    <div className="size-12 animate-pulse rounded-[18px] rounded-bl-[5px] bg-accent ring-4 ring-card" />
                </div>
            </div>
            <div className="flex flex-1 flex-col px-4 pt-8 pb-4">
                <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
                <div className="mt-3 h-3 w-full animate-pulse rounded-md bg-muted" />
                <div className="mt-2 mb-4 h-3 w-4/5 animate-pulse rounded-md bg-muted" />
                <div className="mt-auto h-6 w-28 animate-pulse rounded-full bg-muted" />
            </div>
        </div>
    );
}
