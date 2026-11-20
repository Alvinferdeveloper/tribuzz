"use client"
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { Send, Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme as EmojiPickerTheme } from "emoji-picker-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { BubbleLoader } from "@/src/components/ui/bubble-loader";
import { cn } from "@/src/lib/utils";

interface ImagePreviewModalProps {
    previewImage: string;
    description: string;
    isModalOpen: boolean;
    setDescription: (description: string) => void;
    handleImageSend: () => void;
    closeModal: () => void;
    isUploading: boolean;
}

const CAPTION_MAX = 300;

/**
 * Review a photo before sending it: the image on the night stage, a caption
 * composer like the chat's own input underneath. A Radix dialog, so it
 * traps focus, closes with Escape and is announced to screen readers; full
 * screen on phones, a card on larger screens.
 */
export function ImagePreviewModal({
    previewImage,
    description,
    isModalOpen,
    setDescription,
    handleImageSend,
    closeModal,
    isUploading,
}: ImagePreviewModalProps) {
    const { t } = useTranslation();
    const { resolvedTheme } = useTheme();
    const [showPicker, setShowPicker] = useState(false);

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setDescription((description + emojiData.emoji).slice(0, CAPTION_MAX));
        setShowPicker(false);
    };

    const send = () => {
        if (isUploading) return;
        setShowPicker(false);
        handleImageSend();
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open && !isUploading) { setShowPicker(false); closeModal(); } }}>
            <DialogContent
                showCloseButton={!isUploading}
                className={cn(
                    "flex h-dvh w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 p-0",
                    "sm:h-auto sm:max-h-[min(88dvh,760px)] sm:w-[min(560px,calc(100vw-2rem))] sm:max-w-none sm:rounded-[var(--dialog-radius)] sm:border",
                    // The close button sits over the dark image stage.
                    "[&>[data-slot=dialog-close]]:z-10 [&>[data-slot=dialog-close]]:bg-black/45 [&>[data-slot=dialog-close]]:text-white [&>[data-slot=dialog-close]]:opacity-100 [&>[data-slot=dialog-close]]:backdrop-blur-md [&>[data-slot=dialog-close]]:hover:bg-black/60"
                )}
            >
                <DialogTitle className="sr-only">{t('chat.image_preview.title')}</DialogTitle>
                <DialogDescription className="sr-only">{t('chat.image_preview.description')}</DialogDescription>

                {/* The photo, on a dark stage so any image reads well in both themes */}
                <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[oklch(0.13_0.035_265)] p-3 sm:min-h-[280px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={previewImage}
                        alt={t('chat.image_preview.alt')}
                        className={cn(
                            "max-h-full max-w-full rounded-[10px] object-contain transition-opacity duration-200 sm:max-h-[60dvh]",
                            isUploading && "opacity-60"
                        )}
                    />
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BubbleLoader size="lg" label={t('chat.image_preview.sending')} />
                        </div>
                    )}
                </div>

                {/* Caption composer, same shape as the chat input */}
                <form
                    onSubmit={(e) => { e.preventDefault(); send(); }}
                    className="relative flex shrink-0 items-center gap-2 border-t border-border bg-chat-chrome px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:px-4 sm:pb-3"
                >
                    {showPicker && (
                        <div className="absolute bottom-full left-3 mb-2 z-20 origin-bottom-left animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-150">
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                theme={resolvedTheme === 'dark' ? EmojiPickerTheme.DARK : EmojiPickerTheme.LIGHT}
                                className="chat-emoji-picker"
                            />
                        </div>
                    )}
                    <div className="relative min-w-0 flex-1">
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={CAPTION_MAX}
                            placeholder={t('chat.image_preview.placeholder')}
                            aria-label={t('chat.image_preview.placeholder')}
                            disabled={isUploading}
                            enterKeyHint="send"
                            className="h-11 w-full rounded-full bg-card pl-4 pr-12 text-base shadow-[0_1px_2px_var(--shadow-tint)] ring-1 ring-border/70 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 disabled:opacity-60 md:text-sm"
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowPicker(v => !v)}
                            aria-label={t('chat.input.emoji')}
                            aria-pressed={showPicker}
                            disabled={isUploading}
                            className={cn("absolute inset-y-0 right-1 my-auto size-9", showPicker && "bg-primary/10 text-primary")}
                        >
                            <Smile className="size-5" />
                        </Button>
                    </div>
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isUploading}
                        aria-label={t('chat.image_preview.send')}
                        className="size-11 shrink-0 rounded-full active:scale-95"
                    >
                        {isUploading ? <BubbleLoader size="sm" mono /> : <Send className="size-4" />}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
