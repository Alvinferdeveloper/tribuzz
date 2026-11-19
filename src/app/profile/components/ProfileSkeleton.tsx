import { Card, CardContent, CardHeader } from '@/src/components/ui/card';

// Mirrors UserProfile's layout (header card with avatar, then a 2/3 + 1/3
// grid of cards) so the real profile replaces it without shifting.

function Bar({ className }: { className: string }) {
    return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function SectionCard({ rows }: { rows: number }) {
    return (
        <Card className="border-border/40 bg-card shadow-lg">
            <div className="h-1 w-full bg-muted" />
            <CardHeader className="space-y-2">
                <Bar className="h-5 w-40" />
                <Bar className="h-3.5 w-64 max-w-full" />
            </CardHeader>
            <CardContent className="space-y-5">
                {Array.from({ length: rows }, (_, i) => (
                    <div key={i} className="space-y-2">
                        <Bar className="h-3 w-24" />
                        <Bar className="h-5 w-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export function ProfileSkeleton() {
    return (
        <div aria-hidden="true" className="mx-auto pb-12">
            <Card className="relative mb-8 overflow-hidden border-border/40 bg-card shadow-xl">
                <CardHeader className="p-8">
                    <div className="flex flex-col items-center gap-8 md:flex-row">
                        <div className="h-36 w-36 shrink-0 animate-pulse rounded-full border-4 border-background bg-muted" />
                        <div className="flex w-full flex-1 flex-col items-center gap-3 md:items-start">
                            <Bar className="h-10 w-56 max-w-full" />
                            <Bar className="h-4 w-44" />
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                    <SectionCard rows={2} />
                    <SectionCard rows={1} />
                </div>
                <div className="space-y-6 md:col-span-1">
                    <SectionCard rows={1} />
                    <SectionCard rows={2} />
                </div>
            </div>
        </div>
    );
}
