import Link from 'next/link';
import { Buddy } from '@/src/app/components/brand/Buddy';
import { Button } from '@/src/components/ui/button';
import type { TribeToneKey } from '@/src/app/utils/tribeColor';

interface InfoCtaBandProps {
    title: string;
    text: string;
    href: string;
    action: string;
    buddy?: TribeToneKey;
}

/** Closing coral band for the info pages (FAQ, guidelines, legal): one next step. */
export function InfoCtaBand({ title, text, href, action, buddy = 'sun' }: InfoCtaBandProps) {
    return (
        <aside className="mt-20 flex flex-col items-start gap-6 rounded-[10px] bg-primary px-6 py-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div className="flex items-center gap-4">
                <Buddy name={`cta-${buddy}`} tone={buddy} size={56} className="shrink-0" />
                <div>
                    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                    <p className="mt-1 text-[15px] opacity-90">{text}</p>
                </div>
            </div>
            <Button asChild size="lg" className="shrink-0 bg-[oklch(0.99_0.004_255)] text-[oklch(0.2_0.04_265)] shadow-none hover:bg-white">
                <Link href={href}>{action}</Link>
            </Button>
        </aside>
    );
}
