'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    IconBuddy, IconBubbleHeart, IconBubbleDials, IconBubbleLock, IconBubbleCamera,
    IconBubblePin, IconBubbleMail, IconTypingSpark,
} from '@/src/app/components/brand/icons';
import { useUserProfile } from '../hooks/useUserProfile';
import { EditableField } from './EditableField';
import { EditableSelectField } from './EditableSelectField';
import { EditableHobbies } from './EditableHobbies';
import { ProfileSkeleton } from './ProfileSkeleton';
import { Buddy } from '@/src/app/components/brand/Buddy';
import { tribeTone, type TribeToneKey } from '@/src/app/utils/tribeColor';
import { ConversationGlyph, type ConversationType } from '@/src/app/components/brand/ConversationGlyph';
import { BubbleLoader } from "@/src/components/ui/bubble-loader";
import { cn } from '@/src/lib/utils';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const rise = (i: number) => ({
    initial: { opacity: 0, transform: 'translateY(10px)' },
    animate: { opacity: 1, transform: 'translateY(0px)' },
    transition: { duration: 0.35, delay: i * 0.06, ease: EASE_OUT },
});

export function UserProfile({ targetUsername }: { targetUsername?: string }) {
    const { t } = useTranslation();
    const { user, loading, error, form, updateProfileField, allHobbies, hobbiesLoading, uploadImage, isUploading } = useUserProfile(targetUsername);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isReadOnly = !!targetUsername;

    // Once the profile is on screen, a failed save or upload is a toast, not
    // a reason to replace the whole page with an error.
    useEffect(() => {
        if (!error || !user) return;
        // Upload errors carry a {{type}} placeholder meant for other screens.
        const key = error.startsWith('UPLOAD_') ? 'UPLOAD_GENERIC_ERROR' : error;
        toast.error(t(key, { defaultValue: t('PROFILE_UPDATE_ERROR') }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error]);

    const ageRangeOptions = [
        { value: 'RANGE_19_24', label: t('profile.age_range.19_24') },
        { value: 'RANGE_25_34', label: t('profile.age_range.25_34') },
        { value: 'RANGE_35_44', label: t('profile.age_range.35_44') },
        { value: 'RANGE_45_PLUS', label: t('profile.age_range.45_plus') },
    ];

    const conversationTypeOptions = [
        { value: 'CASUAL', label: t('profile.conversation_type.casual') },
        { value: 'DEEP', label: t('profile.conversation_type.deep') },
        { value: 'LEARNING', label: t('profile.conversation_type.learning') },
        { value: 'SHARING', label: t('profile.conversation_type.sharing') },
    ];

    if (loading) {
        return (
            <>
                <span role="status" className="sr-only">
                    {isReadOnly ? t('profile.loading_other', { targetUsername }) : t('profile.loading_own')}
                </span>
                <ProfileSkeleton />
            </>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center px-4 py-20 text-center">
                <div aria-hidden="true" className="relative mb-6 h-[110px] w-[150px]">
                    <div className="absolute right-0 top-0 flex size-[56px] items-center justify-center rounded-[20px] rounded-bl-[6px] border-2 border-dashed border-muted-foreground/40 bg-card text-2xl font-bold text-muted-foreground">?</div>
                    <Buddy name="lost" tone="violet" size={76} className="absolute bottom-0 left-2" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">{t('profile.not_found')}</h2>
                {error && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t(error, { defaultValue: t('PROFILE_LOAD_ERROR') })}</p>}
            </div>
        );
    }

    const tone = tribeTone(user.username);
    const conversationLabel = conversationTypeOptions.find(o => o.value === user.conversationType)?.label;

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) uploadImage(file);
        event.target.value = '';
    };

    return (
        <div className="pb-12">
            {!isReadOnly && (
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                />
            )}

            {/* HERO: a banner in the person's logo color (same rule as tribes),
                with Buddies peeking over its bottom edge. */}
            <motion.section {...rise(0)} className="overflow-hidden rounded-[10px] bg-card shadow-[var(--card-shadow)] ring-1 ring-border/70">
                <div className={cn("relative h-32 overflow-hidden md:h-44", tone.fill)}>
                    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 800 176" preserveAspectRatio="xMidYMid slice">
                        <path d="M560 26c40 0 72 28 72 64 0 13-4 25-12 35l18 32-38-15c-12 7-26 12-40 12-40 0-72-29-72-64s32-64 72-64z" fill="white" opacity="0.2" />
                        <path d="M690 92c27 0 50 20 50 45s-23 45-50 45c-9 0-18-2-25-6l-27 10 12-22c-6-8-10-17-10-27 0-25 23-45 50-45z" fill="white" opacity="0.13" />
                        <path d="M120 -20c34 0 62 24 62 54s-28 54-62 54c-12 0-22-3-31-8l-31 12 13-26c-7-9-11-20-11-32 0-30 27-54 60-54z" fill="white" opacity="0.1" />
                    </svg>
                    <div aria-hidden="true" className="absolute -bottom-3 right-6 hidden items-end gap-2 sm:flex">
                        {(['teal', 'sun', 'violet', 'coral'] as TribeToneKey[])
                            .filter(k => k !== toneKeyOf(tone.color))
                            .slice(0, 3)
                            .map((k, i) => (
                                <Buddy key={k} name={`banner-${k}`} tone={k} size={[44, 58, 40][i]} delay={i * 0.35} />
                            ))}
                    </div>
                </div>

                <div className="px-5 pb-6 sm:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                        {/* Avatar: their photo, or their Buddy when there's none. */}
                        <div className="relative -mt-12 w-fit shrink-0 sm:-mt-14">
                            <div className="relative flex size-28 items-center justify-center overflow-hidden rounded-full bg-card ring-4 ring-card shadow-[0_6px_18px_-8px_var(--shadow-tint)] sm:size-32">
                                {user.image ? (
                                    <img src={user.image} alt={user.username} className="h-full w-full object-cover" />
                                ) : (
                                    <Buddy name={user.username} size={84} />
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45">
                                        <BubbleLoader size="md" mono className="text-white" label={t('profile.uploading_photo')} />
                                    </div>
                                )}
                            </div>
                            {!isReadOnly && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    aria-label={t('profile.change_photo')}
                                    className="absolute bottom-1 right-1 flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--btn-primary-shadow)] ring-4 ring-card transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-60"
                                >
                                    <IconBubbleCamera className="size-[18px]" />
                                </button>
                            )}
                        </div>

                        <div className="min-w-0 flex-1 sm:pt-4">
                            {isReadOnly ? (
                                <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">{user.username}</h1>
                            ) : (
                                <EditableField
                                    name="username"
                                    label={t('profile.username_label')}
                                    value={user.username}
                                    updateFn={updateProfileField}
                                    maxLength={20}
                                    labelClassName="sr-only"
                                    inputClassName="text-2xl font-bold tracking-tight md:text-3xl"
                                />
                            )}

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                {user.location && (
                                    <span className="inline-flex items-center gap-1.5"><IconBubblePin className="size-4" />{user.location}</span>
                                )}
                                {conversationLabel && (
                                    <span className={cn("inline-flex items-center gap-1.5 rounded-[12px] rounded-bl-[4px] px-2.5 py-1 text-xs font-semibold", tone.soft, tone.ink)}>
                                        <ConversationGlyph type={user.conversationType as ConversationType} className="size-3.5" />{conversationLabel}
                                    </span>
                                )}
                                {!isReadOnly && user.email && (
                                    <span className="inline-flex min-w-0 items-center gap-1.5"><IconBubbleMail className="size-4" /><span className="truncate">{user.email}</span></span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-6">
                    <SectionCard
                        index={1}
                        icon={IconBuddy}
                        tone="coral"
                        title={t('profile.details_title')}
                        description={isReadOnly ? t('profile.details_description_other', { username: user.username }) : t('profile.details_description_own')}
                    >
                        <div className="divide-y divide-border/70">
                            <EditableField
                                name="bio"
                                label={t('profile.bio_label')}
                                value={user.bio}
                                updateFn={updateProfileField}
                                isTextarea
                                placeholder={t('profile.bio_placeholder')}
                                emptyText={t('profile.bio_empty_other', { username: user.username })}
                                maxLength={200}
                                readOnly={isReadOnly}
                            />
                            <EditableField
                                name="location"
                                label={t('profile.location_label')}
                                value={user.location}
                                updateFn={updateProfileField}
                                placeholder={t('profile.location_placeholder')}
                                maxLength={60}
                                readOnly={isReadOnly}
                            />
                        </div>
                    </SectionCard>

                    <SectionCard
                        index={2}
                        icon={IconBubbleHeart}
                        tone="violet"
                        title={t('profile.hobbies_title')}
                        description={isReadOnly ? t('profile.hobbies_description_other', { username: user.username }) : t('profile.hobbies_description_own')}
                    >
                        <EditableHobbies
                            name="hobbies"
                            label=""
                            userHobbies={user.hobbies}
                            allHobbies={allHobbies}
                            hobbiesLoading={hobbiesLoading}
                            control={form.control}
                            updateFn={updateProfileField}
                            readOnly={isReadOnly}
                            emptyText={t('profile.hobbies_empty_other', { username: user.username })}
                        />
                    </SectionCard>
                </div>

                <div className="space-y-6">
                    <SectionCard index={3} icon={IconBubbleDials} tone="teal" title={t('profile.chat_preferences_title')}>
                        <div className="divide-y divide-border/70">
                            <EditableSelectField
                                name="ageRange"
                                label={t('profile.age_range_label')}
                                value={user.ageRange}
                                updateFn={updateProfileField}
                                options={ageRangeOptions}
                                placeholder={t('profile.age_range_placeholder')}
                                readOnly={isReadOnly}
                            />
                            <EditableSelectField
                                name="conversationType"
                                label={t('profile.conversation_type_label')}
                                value={user.conversationType}
                                updateFn={updateProfileField}
                                options={conversationTypeOptions}
                                placeholder={t('profile.conversation_type_placeholder')}
                                readOnly={isReadOnly}
                            />
                        </div>
                    </SectionCard>

                    {isReadOnly ? (
                        <motion.div {...rise(4)} className="flex items-start gap-3 rounded-[10px] bg-tribe-sun/15 p-5">
                            <IconTypingSpark className="mt-0.5 text-tribe-sun-ink" />
                            <p className="text-sm leading-relaxed text-foreground/85">{t('profile.public_hint', { username: user.username })}</p>
                        </motion.div>
                    ) : (
                        <SectionCard index={4} icon={IconBubbleLock} tone="sun" title={t('profile.contact_title')}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('profile.email_label')}</p>
                            <p className="mt-1 break-all text-[15px]">{user.email}</p>
                            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t('profile.email_private_note')}</p>
                        </SectionCard>
                    )}
                </div>
            </div>
        </div>
    );
}

const TONE_CHIP: Record<TribeToneKey, string> = {
    coral: 'bg-tribe-coral/15 text-tribe-coral-ink rounded-bl-[3px]',
    violet: 'bg-tribe-violet/15 text-tribe-violet-ink rounded-br-[3px]',
    teal: 'bg-tribe-teal/20 text-tribe-teal-ink rounded-tl-[3px]',
    sun: 'bg-tribe-sun/25 text-tribe-sun-ink rounded-tr-[3px]',
};

function toneKeyOf(color: string): TribeToneKey {
    return (['coral', 'violet', 'teal', 'sun'] as const).find(k => color.includes(k)) ?? 'coral';
}

function SectionCard({ index, icon: Icon, tone, title, description, children }: {
    index: number;
    icon: React.ComponentType<{ className?: string }>;
    tone: TribeToneKey;
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <motion.section {...rise(index)} className="rounded-[10px] bg-card p-5 shadow-[var(--card-shadow)] ring-1 ring-border/70 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
                <span aria-hidden="true" className={cn("flex size-9 shrink-0 items-center justify-center rounded-[9px]", TONE_CHIP[tone])}>
                    <Icon className="size-[18px]" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-base font-bold tracking-tight">{title}</h2>
                    {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
                </div>
            </div>
            {children}
        </motion.section>
    );
}
