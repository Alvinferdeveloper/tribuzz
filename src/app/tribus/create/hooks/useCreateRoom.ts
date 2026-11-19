'use client';

import { useState } from 'react';
import { z } from 'zod';

// Same limits the API enforces (name is a bit stricter so it fits on a card).
export const ROOM_LIMITS = {
    name: { min: 3, max: 45 },
    short_description: { min: 10, max: 45 },
    full_description: { min: 20, max: 300 },
} as const;

export const RoomSchema = z.object({
    name: z.string()
        .min(ROOM_LIMITS.name.min, `El nombre debe tener al menos ${ROOM_LIMITS.name.min} caracteres.`)
        .max(ROOM_LIMITS.name.max, `El nombre no puede exceder los ${ROOM_LIMITS.name.max} caracteres.`),
    short_description: z.string()
        .min(ROOM_LIMITS.short_description.min, `La descripción corta debe tener al menos ${ROOM_LIMITS.short_description.min} caracteres.`)
        .max(ROOM_LIMITS.short_description.max, `La descripción corta no puede exceder los ${ROOM_LIMITS.short_description.max} caracteres.`),
    full_description: z.string()
        .min(ROOM_LIMITS.full_description.min, `La descripción completa debe tener al menos ${ROOM_LIMITS.full_description.min} caracteres.`)
        .max(ROOM_LIMITS.full_description.max, `La descripción completa no puede exceder los ${ROOM_LIMITS.full_description.max} caracteres.`),
    categoryIds: z.array(z.string()).max(3, "Máximo 3 categorías").optional(),
});

export type RoomFormValues = z.infer<typeof RoomSchema>;

interface RoomData {
    id: string;
    name: string;
}

export function useCreateRoom() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState<'banner' | 'icon' | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const createRoom = async (data: RoomFormValues): Promise<RoomData | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'ROOM_CREATE_ERROR');
            }

            return result.data as RoomData;

        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const uploadRoomImage = async (roomId: string, type: 'banner' | 'icon', file: File) => {
        setUploading(type);
        setUploadError(null);

        try {
            // 1. Get presigned URL
            const presignedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/rooms/${roomId}/generate-upload-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, contentType: file.type }),
                credentials: 'include',
            });

            const presignedResult = await presignedResponse.json();
            if (!presignedResponse.ok) {
                throw new Error(presignedResult.message || 'UPLOAD_URL_ERROR');
            }
            const { signedUploadUrl, publicUrl } = presignedResult;

            // 2. Upload to Supabase
            const uploadResponse = await fetch(signedUploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
            });

            if (!uploadResponse.ok) {
                throw new Error('UPLOAD_SUPABASE_ERROR');
            }

            // 3. Confirm upload with our backend
            const fieldToUpdate = type === 'banner' ? 'server_banner' : 'server_icon';
            const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/rooms/${roomId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [fieldToUpdate]: publicUrl }),
                credentials: 'include',
            });

            const confirmResult = await confirmResponse.json();
            if (!confirmResponse.ok) {
                throw new Error(confirmResult.message || 'CONFIRM_UPLOAD_ERROR');
            }

            return { success: true, publicUrl };

        } catch (err: any) {
            setUploadError(err.message);
            return { success: false, publicUrl: null };
        } finally {
            setUploading(null);
        }
    };

    return {
        createRoom,
        uploadRoomImage,
        loading,
        error,
        uploading,
        uploadError,
    };
}
