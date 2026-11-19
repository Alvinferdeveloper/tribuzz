'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileFormSchema, ProfileFormValues } from '@/src/lib/validators/user';

interface Hobby {
    id: string;
    name: string;
    icon: string;
}

export function useProfileSetup() {
    const [hobbies, setHobbies] = useState<Hobby[]>([]);
    const [hobbiesLoading, setHobbiesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(ProfileFormSchema),
        defaultValues: {
            username: '',
            age: '',
            location: '',
            selectedHobbies: [],
            conversationType: '',
            bio: '',
        },
    });

    useEffect(() => {
        const fetchHobbies = async () => {
            try {
                setHobbiesLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/hobbies`, { credentials: 'include' });
                if (!response.ok) {
                    throw new Error('PROFILE_HOBBIES_LOAD_ERROR');
                }
                const json = await response.json();
                setHobbies(json.data);
            } catch (err: any) {
                setError(err.message || 'PROFILE_HOBBIES_LOAD_ERROR');
            } finally {
                setHobbiesLoading(false);
            }
        };

        fetchHobbies();
    }, []);

    /** Saves the profile; resolves with the error code on failure, null on success. */
    const handleSubmit = async (values: ProfileFormValues, onSuccess: () => void): Promise<string | null> => {
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/users/complete-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: values.username,
                    bio: values.bio,
                    age_range: values.age,
                    location: values.location,
                    hobbies: values.selectedHobbies,
                    conversation_type: values.conversationType,
                }),
                credentials: 'include',
            });

            if (response.ok) {
                onSuccess();
                return null;
            }
            const errorData = await response.json();
            const code = errorData.message || 'PROFILE_SAVE_ERROR';
            setError(code);
            return code;
        } catch {
            setError('PROFILE_SAVE_NETWORK_ERROR');
            return 'PROFILE_SAVE_NETWORK_ERROR';
        }
    };

    return {
        form,
        hobbies,
        hobbiesLoading,
        error,
        handleSubmit,
    };
}
