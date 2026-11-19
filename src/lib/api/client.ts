/**
 * Thin HTTP layer for the Tribuzz API: base URL, session cookies, query
 * strings and typed errors. Feature modules (src/app/<feature>/api) build
 * their requests on top of it, so transport details live in one place.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Failed request. `code` is the API's error code (e.g. "ROOM_NOT_FOUND",
 * usually a translation key), or one of NETWORK_ERROR / RATE_LIMIT /
 * the caller's fallback. `status` is 0 when the request never reached
 * the server.
 */
export class ApiError extends Error {
    constructor(public readonly code: string, public readonly status: number) {
        super(code);
        this.name = 'ApiError';
    }
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
    query?: QueryParams;
    /** Serialized as JSON. */
    body?: unknown;
    /** Error code to use when the response doesn't carry one. */
    fallbackError?: string;
}

function buildUrl(path: string, query?: QueryParams) {
    const url = new URL(path, API_URL);
    for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    }
    return url.toString();
}

export async function apiFetch<T>(path: string, { query, body, fallbackError = 'REQUEST_FAILED', headers, ...init }: ApiFetchOptions = {}): Promise<T> {
    let res: Response;
    try {
        res = await fetch(buildUrl(path, query), {
            credentials: 'include',
            ...init,
            headers: body !== undefined ? { 'Content-Type': 'application/json', ...headers } : headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        // fetch only rejects when the request couldn't complete at all.
        throw new ApiError('NETWORK_ERROR', 0);
    }

    if (res.status === 429) throw new ApiError('RATE_LIMIT', 429);

    const json = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(json?.message || fallbackError, res.status);
    return json as T;
}

/** Shape of the API's paginated list responses. */
export interface Paginated<T> {
    data: T[];
    pagination: {
        currentPage: number;
        hasNextPage: boolean;
        totalPages?: number;
        totalItems?: number;
    };
}

/** Error code for UI messages, whatever was thrown. */
export function errorCode(error: unknown, fallback = 'REQUEST_FAILED'): string {
    return error instanceof ApiError ? error.code : fallback;
}
