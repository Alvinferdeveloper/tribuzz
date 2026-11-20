/**
 * Upload rules, mirrored from the API (tribuzz-api/src/utils/uploadPolicy.ts)
 * so people hear "too big" or "not supported" before uploading instead of
 * after. The API and the storage buckets enforce them for real.
 */

const MB = 1024 * 1024;

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const AUDIO_MIME_TYPES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg'] as const;

/** For <input type="file" accept>. */
export const IMAGE_ACCEPT = IMAGE_MIME_TYPES.join(',');

export const UPLOAD_LIMITS = {
    image: { maxBytes: 5 * MB, types: IMAGE_MIME_TYPES as readonly string[] },
    audio: { maxBytes: 2 * MB, types: AUDIO_MIME_TYPES as readonly string[] },
} as const;

export type UploadKind = keyof typeof UPLOAD_LIMITS;

export type UploadProblem =
    | { code: 'uploads.unsupported' }
    | { code: 'uploads.too_large'; maxMb: number };

/** Why this file can't be uploaded, or null if it can. */
export function checkUpload(file: Blob, kind: UploadKind): UploadProblem | null {
    const rule = UPLOAD_LIMITS[kind];
    const type = file.type.split(';')[0].trim().toLowerCase();
    if (!rule.types.includes(type)) return { code: 'uploads.unsupported' };
    if (file.size > rule.maxBytes) return { code: 'uploads.too_large', maxMb: rule.maxBytes / MB };
    return null;
}
