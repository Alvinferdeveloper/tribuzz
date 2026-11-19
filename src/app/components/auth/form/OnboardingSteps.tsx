'use client';

import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import { Check } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { TopicBadge } from '@/src/app/components/brand/TopicGlyph';
import { ConversationBadge, CONVERSATION_TYPES } from '@/src/app/components/brand/ConversationGlyph';
import { ProfileFormValues } from '@/src/lib/validators/user';
import { cn } from '@/src/lib/utils';

export interface Hobby {
    id: string;
    name: string;
    icon: string;
}

export const USERNAME_MAX = 20;
export const BIO_MAX = 200;

const AGE_RANGES = [
    { value: 'RANGE_19_24', key: 'profile.age_range.19_24' },
    { value: 'RANGE_25_34', key: 'profile.age_range.25_34' },
    { value: 'RANGE_35_44', key: 'profile.age_range.35_44' },
    { value: 'RANGE_45_PLUS', key: 'profile.age_range.45_plus' },
];

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-6">
            <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-[1.75rem]">{title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p>
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p role="alert" className="text-sm font-medium text-destructive">{message}</p>;
}

/** Selected/unselected look shared by the pill choices. */
const pill = (selected: boolean) => cn(
    'inline-flex h-10 cursor-pointer items-center rounded-full px-4 text-sm font-semibold',
    'transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.97]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
    selected
        ? 'bg-foreground text-background shadow-[0_4px_12px_-6px_var(--shadow-tint)]'
        : 'bg-card text-muted-foreground ring-1 ring-border hover:text-foreground hover:ring-muted-foreground/40'
);

/* ------------------------------------------------------------ step 1 */

export function StepIdentity() {
    const { t } = useTranslation();
    const { control, watch, formState: { errors } } = useFormContext<ProfileFormValues>();
    const username = watch('username') ?? '';

    return (
        <div>
            <StepHeading title={t('onboarding.identity.title')} subtitle={t('onboarding.identity.subtitle')} />

            <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                    <Label htmlFor="onboarding-username" className="text-sm font-semibold">{t('onboarding.identity.username_label')}</Label>
                    <span className="text-xs tabular-nums text-muted-foreground">{username.length}/{USERNAME_MAX}</span>
                </div>
                <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            id="onboarding-username"
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            maxLength={USERNAME_MAX}
                            aria-invalid={!!errors.username}
                            placeholder={t('onboarding.identity.username_placeholder')}
                            className="h-12 text-base"
                        />
                    )}
                />
                <FieldError message={errors.username?.message} />
            </div>

            <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('onboarding.optional')}</p>

                <fieldset className="mt-4">
                    <legend className="mb-2.5 text-sm font-semibold">{t('onboarding.identity.age_label')}</legend>
                    <Controller
                        name="age"
                        control={control}
                        render={({ field }) => (
                            <div role="radiogroup" aria-label={t('onboarding.identity.age_label')} className="flex flex-wrap gap-2">
                                {AGE_RANGES.map(range => {
                                    const selected = field.value === range.value;
                                    return (
                                        <button
                                            key={range.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={selected}
                                            // Tapping the chosen range again clears it: it's optional.
                                            onClick={() => field.onChange(selected ? '' : range.value)}
                                            className={pill(selected)}
                                        >
                                            {t(range.key)}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    />
                </fieldset>

                <div className="mt-5 space-y-2">
                    <Label htmlFor="onboarding-location" className="text-sm font-semibold">{t('onboarding.identity.location_label')}</Label>
                    <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="onboarding-location"
                                autoComplete="address-level2"
                                maxLength={60}
                                placeholder={t('onboarding.identity.location_placeholder')}
                                className="h-11"
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------ step 2 */

export function StepHobbies({ hobbies, loading }: { hobbies: Hobby[]; loading: boolean }) {
    const { t } = useTranslation();
    const { watch, setValue, formState: { errors } } = useFormContext<ProfileFormValues>();
    const selected = watch('selectedHobbies') ?? [];

    const toggle = (id: string) => {
        const next = selected.includes(id) ? selected.filter(h => h !== id) : [...selected, id];
        setValue('selectedHobbies', next, { shouldValidate: true });
    };

    return (
        <div>
            <StepHeading title={t('onboarding.hobbies.title')} subtitle={t('onboarding.hobbies.subtitle')} />

            {loading ? (
                <div aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="flex h-[104px] flex-col items-center justify-center gap-3 rounded-[10px] bg-card ring-1 ring-border/70">
                            <div className="size-11 animate-pulse rounded-[15px] bg-muted" />
                            <div className="h-3 w-16 animate-pulse rounded-md bg-muted" />
                        </div>
                    ))}
                </div>
            ) : (
                <div role="group" aria-label={t('onboarding.hobbies.title')} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {hobbies.map(hobby => {
                        const isSelected = selected.includes(hobby.id);
                        return (
                            <button
                                key={hobby.id}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => toggle(hobby.id)}
                                className={cn(
                                    'relative flex h-[104px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[10px] bg-card px-2 text-sm font-semibold',
                                    'transition-[box-shadow,transform,background-color] duration-150 ease-out active:scale-[0.97]',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                                    isSelected
                                        ? 'bg-primary/[0.06] ring-2 ring-primary shadow-[0_6px_18px_-10px_var(--shadow-tint)]'
                                        : 'ring-1 ring-border/70 hover:ring-muted-foreground/40'
                                )}
                            >
                                <TopicBadge name={hobby.name} icon={hobby.icon} />
                                <span className="text-center leading-tight">{hobby.name}</span>
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[opacity,transform] duration-150 ease-out',
                                        isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                                    )}
                                >
                                    <Check className="size-3" strokeWidth={3} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <FieldError message={errors.selectedHobbies?.message} />
                <span className="ml-auto tabular-nums text-muted-foreground">{t('onboarding.hobbies.count', { count: selected.length })}</span>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------ step 3 */

export function StepConversation() {
    const { t } = useTranslation();
    const { control, watch, formState: { errors } } = useFormContext<ProfileFormValues>();
    const bio = watch('bio') ?? '';

    return (
        <div>
            <StepHeading title={t('onboarding.conversation.title')} subtitle={t('onboarding.conversation.subtitle')} />

            <Controller
                name="conversationType"
                control={control}
                render={({ field }) => (
                    <div role="radiogroup" aria-label={t('onboarding.conversation.title')} className="grid gap-3 sm:grid-cols-2">
                        {CONVERSATION_TYPES.map(type => {
                            const selected = field.value === type.value;
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => field.onChange(type.value)}
                                    className={cn(
                                        'flex cursor-pointer items-start gap-3.5 rounded-[10px] bg-card p-4 text-left',
                                        'transition-[box-shadow,transform,background-color] duration-150 ease-out active:scale-[0.98]',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                                        selected
                                            ? 'bg-primary/[0.06] ring-2 ring-primary shadow-[0_6px_18px_-10px_var(--shadow-tint)]'
                                            : 'ring-1 ring-border/70 hover:ring-muted-foreground/40'
                                    )}
                                >
                                    <ConversationBadge type={type.value} />
                                    <span className="min-w-0">
                                        <span className="block text-[15px] font-semibold leading-snug">{t(`profile.conversation_type.${type.key}`)}</span>
                                        <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{t(`onboarding.conversation.${type.key}_desc`)}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            />
            <div className="mt-2"><FieldError message={errors.conversationType?.message} /></div>

            <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('onboarding.optional')}</p>
                <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                        <Label htmlFor="onboarding-bio" className="text-sm font-semibold">{t('onboarding.conversation.bio_label')}</Label>
                        <span className="text-xs tabular-nums text-muted-foreground">{bio.length}/{BIO_MAX}</span>
                    </div>
                    <Controller
                        name="bio"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                {...field}
                                id="onboarding-bio"
                                maxLength={BIO_MAX}
                                placeholder={t('onboarding.conversation.bio_placeholder')}
                                className="min-h-[88px] resize-none"
                            />
                        )}
                    />
                    <FieldError message={errors.bio?.message} />
                </div>
            </div>
        </div>
    );
}
