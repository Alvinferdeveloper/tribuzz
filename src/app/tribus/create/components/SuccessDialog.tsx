import { Trans, useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button";
import { Clock } from "lucide-react";
import { Buddy } from "@/src/app/components/brand/Buddy";
import type { TribeToneKey } from "@/src/app/utils/tribeColor";

// Little celebration over the dialog: Buddies cheering, confetti bubbles.
const CHEER: { tone: TribeToneKey; size: number; delay: number }[] = [
    { tone: 'violet', size: 50, delay: 0.4 },
    { tone: 'coral', size: 70, delay: 0 },
    { tone: 'teal', size: 56, delay: 0.7 },
];

const CONFETTI = [
    { className: 'left-[18%] top-2 size-3 bg-tribe-sun rounded-tr-[2px]', delay: '0s' },
    { className: 'left-[30%] top-9 size-2 bg-tribe-coral rounded-bl-[1px]', delay: '0.5s' },
    { className: 'right-[22%] top-3 size-2.5 bg-tribe-teal rounded-tl-[1px]', delay: '0.9s' },
    { className: 'right-[33%] top-10 size-2 bg-tribe-violet rounded-br-[1px]', delay: '1.3s' },
];

export default function SuccessDialog({
    showSuccessDialog,
    setShowSuccessDialog,
    handleDialogClose,
    room
}: {
    showSuccessDialog: boolean;
    setShowSuccessDialog: (showSuccessDialog: boolean) => void;
    handleDialogClose: () => void;
    room: { name: string };
}) {
    const { t } = useTranslation();
    return (
        <Dialog
            open={showSuccessDialog}
            // However it's dismissed, the tribe exists now: take them to it.
            onOpenChange={(open) => (open ? setShowSuccessDialog(true) : handleDialogClose())}
        >
            <DialogContent className="sm:max-w-md">
                <div aria-hidden="true" className="relative -mt-2 flex h-24 items-end justify-center gap-2">
                    {CONFETTI.map((c, i) => (
                        <span key={i} className={`brand-anim brand-float absolute rounded-full ${c.className}`} style={{ animationDelay: c.delay }} />
                    ))}
                    {CHEER.map((b, i) => (
                        <Buddy key={i} name={`cheer-${i}`} tone={b.tone} size={b.size} delay={b.delay} />
                    ))}
                </div>

                <DialogHeader className="items-center text-center sm:text-center">
                    <DialogTitle className="text-2xl font-bold tracking-tight">{t('rooms.create.success.title')}</DialogTitle>
                    <DialogDescription className="mt-1 text-base">
                        <Trans i18nKey="rooms.create.success.description" values={{ roomName: room.name }} />
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-start gap-3 rounded-2xl bg-tribe-sun/20 p-4">
                    <Clock className="mt-0.5 size-5 shrink-0 text-tribe-sun-ink" />
                    <p className="text-sm leading-relaxed text-foreground">{t('rooms.create.success.review_note')}</p>
                </div>

                <Button onClick={handleDialogClose} size="lg" className="mt-2 w-full">
                    {t('rooms.create.success.go_to_my_rooms')}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
