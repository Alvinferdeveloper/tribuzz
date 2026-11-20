'use client';

import { IMAGE_ACCEPT } from "@/src/lib/uploads";
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateRoom } from '../hooks/useCreateRoom';
import { Button } from '@/src/components/ui/button';
import { ImagePlus, Check, ArrowRight, CircleAlert, RefreshCw } from 'lucide-react';
import SuccessDialog from '@/src/app/tribus/create/components/SuccessDialog';
import { tribeTone } from '@/src/app/utils/tribeColor';
import { cn } from '@/src/lib/utils';
import { useRouter } from 'next/navigation';
import { BubbleLoader } from "@/src/components/ui/bubble-loader";

interface RoomData {
    id: string;
    name: string;
}

interface CustomizeRoomProps {
    room: RoomData;
    /** Chosen images (object URLs) for the preview panel beside the form. */
    onImagesChange: (images: { bannerUrl?: string; iconUrl?: string }) => void;
}

export function CustomizeRoom({ room, onImagesChange }: CustomizeRoomProps) {
    const { t } = useTranslation();
    const { uploadRoomImage, uploading, uploadError } = useCreateRoom();
    const router = useRouter();
    const tone = tribeTone(room.name);

    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        onImagesChange({ bannerUrl: bannerPreview ?? undefined, iconUrl: iconPreview ?? undefined });
    }, [bannerPreview, iconPreview, onImagesChange]);

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const iconInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'icon') => {
        const file = event.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        if (type === 'banner') {
            setBannerFile(file);
            setBannerPreview(previewUrl);
        } else {
            setIconFile(file);
            setIconPreview(previewUrl);
        }
    };

    const handleFinalize = async () => {
        if (bannerFile) {
            const res = await uploadRoomImage(room.id, 'banner', bannerFile);
            if (!res.success) return;
        }
        if (iconFile) {
            const res = await uploadRoomImage(room.id, 'icon', iconFile);
            if (!res.success) return;
        }
        setShowSuccessDialog(true);
    };

    const handleDialogClose = () => {
        setShowSuccessDialog(false);
        router.push('/tribus/my-rooms');
    };

    const isUploading = !!uploading;

    return (
        <>
            <div className="rounded-[var(--card-radius)] bg-card p-5 shadow-[var(--card-shadow)] ring-1 ring-border/70 sm:p-7">
                <h2 className="text-lg font-bold tracking-tight">{t('rooms.create.customize.resource_upload')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t('rooms.create.customize.formats')}</p>

                {/* Banner */}
                <section className="mt-6 space-y-2.5">
                    <UploadLabel label={t('rooms.create.customize.banner_label')} hint={t('rooms.create.customize.banner_size')} selected={!!bannerPreview} />
                    <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} className="hidden" accept={IMAGE_ACCEPT} />
                    <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={isUploading}
                        className={cn(
                            "group relative flex h-36 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl transition-[border-color,background-color] duration-200",
                            bannerPreview ? "ring-1 ring-border/70" : "border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5"
                        )}
                    >
                        {uploading === 'banner' ? (
                            <BubbleLoader size="md" label={t('rooms.create.customize.uploading')} />
                        ) : bannerPreview ? (
                            <>
                                <img src={bannerPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />
                                <ChangeBadge label={t('rooms.create.customize.change_image')} />
                            </>
                        ) : (
                            <>
                                <span className={cn("mb-2 flex size-11 items-center justify-center rounded-[16px] rounded-bl-[5px]", tone.soft, tone.ink)}>
                                    <ImagePlus className="size-5" />
                                </span>
                                <span className="text-sm font-semibold">{t('rooms.create.customize.upload_banner')}</span>
                            </>
                        )}
                    </button>
                </section>

                {/* Icon: same squircle-with-a-tail shape the card gives it. */}
                <section className="mt-6 space-y-2.5">
                    <UploadLabel label={t('rooms.create.customize.icon_label')} hint={t('rooms.create.customize.icon_size_hint')} selected={!!iconPreview} />
                    <input type="file" ref={iconInputRef} onChange={(e) => handleFileChange(e, 'icon')} className="hidden" accept={IMAGE_ACCEPT} />
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => iconInputRef.current?.click()}
                            disabled={isUploading}
                            aria-label={t('rooms.create.customize.icon_label')}
                            className={cn(
                                "group relative flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[30px] transition-[border-color,background-color] duration-200",
                                tone.tail,
                                iconPreview ? "ring-1 ring-border/70" : "border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5"
                            )}
                        >
                            {uploading === 'icon' ? (
                                <BubbleLoader size="sm" />
                            ) : iconPreview ? (
                                <>
                                    <img src={iconPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />
                                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                                        <RefreshCw className="size-5 text-white" />
                                    </span>
                                </>
                            ) : (
                                <ImagePlus className="size-6 text-muted-foreground transition-colors group-hover:text-primary" />
                            )}
                        </button>
                        <p className="text-sm text-muted-foreground">{t('rooms.create.customize.icon_desc')}</p>
                    </div>
                </section>

                {uploadError && (
                    <div role="alert" className="mt-6 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
                        <CircleAlert className="mt-0.5 size-4 shrink-0" />
                        {t(uploadError, { defaultValue: t('UPLOAD_FAILED') })}
                    </div>
                )}

                <Button onClick={handleFinalize} disabled={isUploading} size="lg" className="mt-7 h-12 w-full text-base">
                    {isUploading ? <BubbleLoader size="sm" mono /> : null}
                    {t(bannerFile || iconFile ? 'rooms.create.customize.finalize' : 'rooms.create.customize.skip')}
                    {!isUploading && <ArrowRight className="size-4" />}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">{t('rooms.create.customize.change_later')}</p>
            </div>

            <SuccessDialog
                showSuccessDialog={showSuccessDialog}
                setShowSuccessDialog={setShowSuccessDialog}
                handleDialogClose={handleDialogClose}
                room={room}
            />
        </>
    );
}

function UploadLabel({ label, hint, selected }: { label: string; hint: string; selected: boolean }) {
    const { t } = useTranslation();
    return (
        <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold">{label}</h3>
            {selected ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-tribe-teal-ink">
                    <Check className="size-3.5" /> {t('rooms.create.customize.selected')}
                </span>
            ) : (
                <span className="text-xs text-muted-foreground">{hint}</span>
            )}
        </div>
    );
}

function ChangeBadge({ label }: { label: string }) {
    return (
        <span className="relative z-10 flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-semibold text-card-foreground shadow-sm backdrop-blur-sm transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:opacity-100">
            <RefreshCw className="size-3.5" />
            {label}
        </span>
    );
}
