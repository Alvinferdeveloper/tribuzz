'use client'
import { useTranslation } from 'react-i18next';
import { ExternalLink, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/src/components/ui/dialog';

interface ImageViewerModalProps {
    isOpen: boolean;
    imageUrl: string | null;
    onClose: () => void;
}

/** Glass circle buttons that read over any photo. */
const OVERLAY_BUTTON = "flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-[background-color,transform] duration-150 hover:bg-black/65 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

/**
 * Full-screen photo viewer for chat images and GIFs. Closes with Escape,
 * the × or a tap outside the image, and keeps focus inside while open.
 */
export function ImageViewerModal({ isOpen, imageUrl, onClose }: ImageViewerModalProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={isOpen && Boolean(imageUrl)} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent
                showCloseButton={false}
                className="h-dvh w-screen max-w-none rounded-none border-0 bg-transparent p-0 shadow-none sm:max-w-none"
                // A tap on the dark area around the photo closes it.
                onClick={onClose}
            >
                <DialogTitle className="sr-only">{t('chat.image_viewer.alt')}</DialogTitle>
                <DialogDescription className="sr-only">{t('chat.image_viewer.description')}</DialogDescription>

                <div className="absolute inset-0 bg-[oklch(0.08_0.03_265/0.92)]" aria-hidden="true" />

                <div className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top,0px))] z-10 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {imageUrl && (
                        <a href={imageUrl} target="_blank" rel="noopener noreferrer" aria-label={t('chat.image_viewer.open_original')} className={OVERLAY_BUTTON}>
                            <ExternalLink className="size-[18px]" />
                        </a>
                    )}
                    <DialogClose aria-label={t('chat.image_viewer.close')} className={OVERLAY_BUTTON}>
                        <X className="size-5" />
                    </DialogClose>
                </div>

                <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-10">
                    {imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={imageUrl}
                            alt={t('chat.image_viewer.alt')}
                            onClick={(e) => e.stopPropagation()}
                            className="max-h-full max-w-full rounded-[10px] object-contain shadow-[0_24px_60px_-20px_oklch(0.05_0.03_265/0.8)] animate-in fade-in zoom-in-95 duration-200"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
