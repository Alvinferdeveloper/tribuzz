// Mirrors UserProfile's layout (banner hero with avatar, then a main column
// and a 340px side column of cards) so the real profile replaces it without
// shifting.

function Bar({ className }: { className: string }) {
    return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function SectionCard({ rows }: { rows: number }) {
    return (
        <div className="rounded-[10px] bg-card p-5 shadow-[var(--card-shadow)] ring-1 ring-border/70 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
                <div className="size-9 shrink-0 animate-pulse rounded-[9px] bg-muted" />
                <div className="flex-1 space-y-2">
                    <Bar className="h-4 w-36" />
                    <Bar className="h-3.5 w-56 max-w-full" />
                </div>
            </div>
            <div className="space-y-5">
                {Array.from({ length: rows }, (_, i) => (
                    <div key={i} className="space-y-2">
                        <Bar className="h-3 w-20" />
                        <Bar className="h-4 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div aria-hidden="true" className="pb-12">
            <div className="overflow-hidden rounded-[10px] bg-card shadow-[var(--card-shadow)] ring-1 ring-border/70">
                <div className="h-32 animate-pulse bg-muted md:h-44" />
                <div className="px-5 pb-6 sm:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                        <div className="-mt-12 size-28 shrink-0 rounded-full bg-card ring-4 ring-card sm:-mt-14 sm:size-32">
                            <div className="size-full animate-pulse rounded-full bg-muted" />
                        </div>
                        <div className="flex-1 space-y-3 sm:pt-4">
                            <Bar className="h-8 w-48" />
                            <Bar className="h-4 w-64 max-w-full" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-6">
                    <SectionCard rows={2} />
                    <SectionCard rows={1} />
                </div>
                <div className="space-y-6">
                    <SectionCard rows={2} />
                    <SectionCard rows={1} />
                </div>
            </div>
        </div>
    );
}
