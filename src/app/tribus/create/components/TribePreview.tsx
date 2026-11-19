'use client';

import { useTranslation } from 'react-i18next';
import { RoomCardBanner } from '@/src/app/tribus/components/RoomCardBanner';
import { RoomCardContent } from '@/src/app/tribus/components/RoomCardContent';
import { Buddy } from '@/src/app/components/brand/Buddy';

export interface TribeDraft {
    name: string;
    description: string;
    categories: { id: string; name: string; icon: string | null }[];
}

interface TribePreviewProps extends TribeDraft {
    bannerUrl?: string;
    iconUrl?: string;
}

/**
 * Live preview built from the real explore card pieces (banner + content),
 * so what the creator sees is exactly what people will find in /tribus.
 */
export function TribePreview({ name, description, categories, bannerUrl, iconUrl }: TribePreviewProps) {
    const { t } = useTranslation();
    const displayName = name.trim() || t('rooms.create.preview.name_fallback');

    return (
        <div className="relative">
            <article aria-label={displayName} className="relative flex flex-col overflow-hidden rounded-[10px] bg-card text-card-foreground shadow-[0_2px_4px_var(--shadow-tint),0_18px_36px_-18px_var(--shadow-tint)] ring-1 ring-border/70">
                <RoomCardBanner roomName={displayName} serverBanner={bannerUrl} serverIcon={iconUrl} />
                <RoomCardContent
                    name={displayName}
                    description={description.trim() || t('rooms.create.customize.preview_desc_fallback')}
                    verified={false}
                    userCount={0}
                    isConnecting={false}
                    categories={categories}
                />
            </article>

            {/* A Buddy peeking over the card: someone's already curious. */}
            <Buddy name="preview-peek" tone="sun" size={44} className="absolute -right-3 -top-6" />
        </div>
    );
}
