'use client';

import { useState } from 'react';
import { tribeTone } from '@/src/app/utils/tribeColor';
import { cn } from '@/src/lib/utils';

interface RoomCardBannerProps {
    roomName: string;
    serverBanner?: string;
    serverIcon?: string;
    children?: React.ReactNode;
}

export function RoomCardBanner({ roomName, serverBanner, serverIcon, children }: RoomCardBannerProps) {
    const [bannerError, setBannerError] = useState(false);
    const [iconError, setIconError] = useState(false);
    // A tribe without artwork still gets an identity: one of the logo's four
    // bubble colors, picked from its name so it never changes between visits.
    const tone = tribeTone(roomName);

    return (
        <div className="relative shrink-0">
            <div className={cn("relative h-[124px] w-full overflow-hidden", tone.fill)}>
                {serverBanner && !bannerError ? (
                    <img
                        src={serverBanner}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-[1.03]"
                        onError={() => setBannerError(true)}
                    />
                ) : (
                    // Echo of the logo: overlapping speech-bubble shapes, tone on tone.
                    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 320 124" preserveAspectRatio="xMidYMid slice">
                        <path d="M228 18c26 0 47 19 47 43 0 9-3 17-8 24l12 21-25-10c-8 5-17 8-26 8-26 0-47-19-47-43s21-43 47-43z" fill="white" opacity="0.22" />
                        <path d="M272 70c18 0 33 13 33 30s-15 30-33 30c-6 0-12-2-17-4l-18 7 8-15c-4-5-6-11-6-18 0-17 15-30 33-30z" fill="white" opacity="0.14" />
                    </svg>
                )}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/25 to-transparent" />
                {children}
            </div>

            <div className="absolute -bottom-5 left-4 z-10">
                <div className={cn(
                    "flex size-12 items-center justify-center overflow-hidden rounded-[18px] ring-4 ring-card shadow-[0_2px_6px_var(--shadow-tint)]",
                    tone.fill, tone.tail
                )}>
                    {serverIcon && !iconError ? (
                        <img
                            src={serverIcon}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={() => setIconError(true)}
                        />
                    ) : (
                        <span className="select-none text-lg font-bold text-[oklch(0.2_0.04_265)]">
                            {roomName.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
