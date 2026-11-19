import { type ReactNode } from 'react';
import { Buddy } from '@/src/app/components/brand/Buddy';
import { type TribeToneKey } from '@/src/app/utils/tribeColor';
import { cn } from '@/src/lib/utils';

const BUBBLE_TONES = {
  sun: 'bg-tribe-sun',
  teal: 'bg-tribe-teal',
} as const;

interface AuthBadgeProps {
  /** What the Buddy is "saying": an icon or a short glyph. */
  children: ReactNode;
  bubbleTone: keyof typeof BUBBLE_TONES;
  buddyName: string;
  buddyTone: TribeToneKey;
}

/** A Buddy with a speech bubble, used at the top of auth status screens. */
export function AuthBadge({ children, bubbleTone, buddyName, buddyTone }: AuthBadgeProps) {
  return (
    <div aria-hidden="true" className="relative mb-7 h-[104px] w-[150px]">
      <span className={cn(
        'brand-anim brand-float absolute right-0 top-0 flex size-[58px] items-center justify-center rounded-[20px] rounded-bl-[6px] text-[oklch(0.2_0.04_265)]',
        BUBBLE_TONES[bubbleTone],
      )}>
        {children}
      </span>
      <Buddy name={buddyName} tone={buddyTone} size={74} className="absolute bottom-0 left-0" />
    </div>
  );
}

export function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
