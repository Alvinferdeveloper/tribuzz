import { useTranslation } from 'react-i18next';
import { formatDate } from "@/src/app/utils/date";
import { Calendar } from "lucide-react";
import { Room, RoomStatus } from "@/src/app/tribus/hooks/useRoom";
import { cn } from "@/src/lib/utils";

interface Props {
    room: Room;
}

/** Status colors from the logo palette: sun = waiting, teal = live, red = rejected. */
export const ROOM_STATUS_TONE: Record<RoomStatus, { pill: string; dot: string; labelKey: string }> = {
    IN_REVISION: { pill: 'bg-tribe-sun/25 text-tribe-sun-ink', dot: 'bg-tribe-sun', labelKey: 'rooms.status.in_revision' },
    ACCEPTED: { pill: 'bg-tribe-teal/20 text-tribe-teal-ink', dot: 'bg-tribe-teal', labelKey: 'rooms.status.accepted' },
    REJECTED: { pill: 'bg-destructive/10 text-destructive', dot: 'bg-destructive', labelKey: 'rooms.status.rejected' },
};

export default function RoomCardFooter({ room }: Props) {
    const { t } = useTranslation();
    const tone = ROOM_STATUS_TONE[room.status];

    return (
        <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>{formatDate(room.created_at)}</span>
            </div>

            {/* Speech-bubble pill (pointed bottom-left corner, like the logo). */}
            <span className={cn("inline-flex items-center gap-1.5 rounded-[12px] rounded-bl-[4px] px-2.5 py-1 text-[11px] font-semibold", tone.pill)}>
                <span aria-hidden="true" className={cn("size-1.5 rounded-full", tone.dot, room.status === 'IN_REVISION' && "animate-pulse")} />
                {t(tone.labelKey)}
            </span>
        </div>
    );
}
