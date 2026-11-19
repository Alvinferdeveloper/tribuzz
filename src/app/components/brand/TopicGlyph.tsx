import { tribeTone } from "@/src/app/utils/tribeColor";
import { cn } from "@/src/lib/utils";

/**
 * Hand-drawn glyphs for topics: the hobbies people pick and the categories
 * tribes belong to (many overlap: art, music, cooking…). Brand line style:
 * 24px grid, 2px round strokes, currentColor. Topics come from the API with
 * an emoji as their icon; when we have a glyph for the topic's name we draw
 * it, otherwise we fall back to that emoji, so a topic an admin adds later
 * still shows something meaningful instead of a question mark.
 */

const GLYPHS: Record<string, React.ReactNode> = {
    musica: (
        <>
            <path d="M9 17V5.5l10-2V15" />
            <circle cx="7" cy="17" r="2.2" />
            <circle cx="17" cy="15" r="2.2" />
        </>
    ),
    fotografia: (
        <>
            <rect x="3" y="7" width="18" height="12.5" rx="3.5" />
            <path d="M8.5 7l1.4-2.3h4.2L15.5 7" />
            <circle cx="12" cy="13.2" r="3.2" />
        </>
    ),
    lectura: (
        <>
            <path d="M12 6.8C10 5.2 7 5 4 5.7v12c3-.7 6-.5 8 1.1 2-1.6 5-1.8 8-1.1v-12c-3-.7-6-.5-8 1.1z" />
            <path d="M12 6.8v12" />
        </>
    ),
    videojuegos: (
        <>
            <path d="M7.5 8h9a4.5 4.5 0 0 1 4.5 4.5v1a2.6 2.6 0 0 1-4.8 1.4L15 13H9l-1.2 1.9A2.6 2.6 0 0 1 3 13.5v-1A4.5 4.5 0 0 1 7.5 8z" />
            <path d="M8 10v3.4M6.3 11.7h3.4M15.6 10.8h.01M17.6 12.6h.01" />
        </>
    ),
    arte: (
        <>
            <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 2-.9 1.6-2-.5-1.3.3-2.6 1.7-2.6h1.7a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-8.9-8.5-8.9z" />
            <path d="M7.6 11.2h.01M9.6 7.6h.01M14 7.2h.01" strokeWidth={2.6} />
        </>
    ),
    viajes: (
        <>
            <path d="M20.5 3.5 3.5 10.6l6.8 2.6 2.6 6.8z" />
            <path d="M10.3 13.2l4.4-4.4" />
        </>
    ),
    cafe: (
        <>
            <path d="M5 9.5h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" />
            <path d="M16 10.5h1.3a2.5 2.5 0 0 1 0 5H16" />
            <path d="M8.5 3.5c-.9 1 .9 2 0 3.2M12.2 3.5c-.9 1 .9 2 0 3.2" />
        </>
    ),
    fitness: (
        <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />
    ),
    deportes: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 8l3.3 2.4-1.3 3.9h-4l-1.3-3.9z" />
            <path d="M12 3.5V8M15.3 10.4l4.3-1.2M14 14.3l2.6 3.7M10 14.3 7.4 18M8.7 10.4 4.4 9.2" />
        </>
    ),
    cocina: (
        <>
            <circle cx="10" cy="13.5" r="6" />
            <path d="M16 13h5" />
            <path d="M8 4c-.8.9.8 1.8 0 2.8M11.5 4c-.8.9.8 1.8 0 2.8" />
        </>
    ),
    mascotas: (
        <>
            <path d="M12 12.2c-2.8 0-5 2.6-5 4.8 0 1.6 1.4 2.5 3 2.1 1.4-.4 2.6-.4 4 0 1.6.4 3-.5 3-2.1 0-2.2-2.2-4.8-5-4.8z" />
            <circle cx="6" cy="10" r="1.7" />
            <circle cx="9.3" cy="6.4" r="1.7" />
            <circle cx="14.7" cy="6.4" r="1.7" />
            <circle cx="18" cy="10" r="1.7" />
        </>
    ),
    cine: (
        <>
            <path d="M4 9.5h16V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
            <path d="M4 9.5 5.2 5.5h14.6L20 9.5M8.6 5.5 7.4 9.5M13.1 5.5l-1.2 4M17.6 5.5l-1.2 4" />
        </>
    ),
    tecnologia: (
        <>
            <rect x="5" y="5.5" width="14" height="9.5" rx="1.5" />
            <path d="M3 18.5h18" />
        </>
    ),
    naturaleza: (
        <>
            <path d="M2.5 19.5 9 10l4.2 6 2.6-3.6 5.7 7.1z" />
            <circle cx="17" cy="6.5" r="2.2" />
        </>
    ),
    baile: (
        <>
            <circle cx="13.5" cy="4.5" r="1.8" />
            <path d="M12.8 7.6 10.2 13l3.6 2.4-1.6 5" />
            <path d="M10.2 13 6 14.2M12.8 7.6l3.9 2.6 2.3-2.2" />
        </>
    ),
    escritura: (
        <>
            <path d="M20 4c-8 0-13 5-14 14l12-6c1.5-2.5 2-5 2-8z" />
            <path d="M6 18l8-8M3.5 20.5 6 18" />
        </>
    ),
    idiomas: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5M12 3.5C9.6 5.8 8.4 8.7 8.4 12s1.2 6.2 3.6 8.5" />
        </>
    ),
    astronomia: (
        <>
            <circle cx="11" cy="13" r="5" />
            <path d="M5.4 16.6C2.9 18.4 2 20 2.6 20.6c1.2 1.2 6.4-1.6 11.6-6.8S22.2 3.4 21 2.2c-.6-.6-2.2.3-4 2.8" />
            <path d="M19.5 15.5v3M18 17h3" />
        </>
    ),
    anime: (
        <>
            <path d="M12 2.8l1.9 3.7 4-1.3-1.2 4L20.5 11l-3.6 1.9 1.2 4-4-1.2L12 19.4l-2.1-3.7-4 1.2 1.2-4L3.5 11l3.6-1.8-1.2-4 4 1.3z" />
            <path d="M12 8.2v3.6M12 14.4h.01" />
        </>
    ),
    manualidades: (
        <>
            <circle cx="10.5" cy="13.5" r="6.5" />
            <path d="M5.2 9.8c3.4 0 7 2.8 8.6 8.6M4 13.6c3 .4 5.4 2.4 6.4 6.3M8 7.4c2.8 1.3 5.6 4.6 6.4 8.6" />
            <path d="M15.5 8.5 21 3" />
        </>
    ),
    noticias: (
        <>
            <path d="M5 4.5h11a1 1 0 0 1 1 1V19a1.5 1.5 0 0 0 1.5 1.5H6.5A2.5 2.5 0 0 1 4 18V5.5a1 1 0 0 1 1-1z" />
            <path d="M17 9h2.5a.5.5 0 0 1 .5.5V19a1.5 1.5 0 0 1-3 0" />
            <path d="M7.5 8.5h6M7.5 12h6M7.5 15.5h3.5" />
        </>
    ),
    saludmental: (
        <>
            <path d="M12 20.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10-7.5 10z" />
            <path d="M8.5 12.5h2l1.2-2.2 1.6 4 1.2-1.8h1.5" />
        </>
    ),
    ciencia: (
        <>
            <path d="M9.5 3.5h5M10.5 3.5v5.2L5.2 17.6A2 2 0 0 0 7 20.5h10a2 2 0 0 0 1.8-2.9l-5.3-8.9V3.5" />
            <path d="M7.4 14.5h9.2" />
        </>
    ),
    entretenimiento: (
        <>
            <path d="M4 8a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2.5a2 2 0 0 0 0 4V17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5a2 2 0 0 0 0-4z" />
            <path d="M14.5 7v2M14.5 11.5v1M14.5 15v3" />
        </>
    ),
};

/** Other names the same hobby goes by. */
const ALIASES: Record<string, string> = {
    gaming: "videojuegos",
    juegos: "videojuegos",
    "cine y tv": "cine",
    deporte: "deportes",
    libros: "lectura",
    viajar: "viajes",
    gimnasio: "fitness",
    "cine y series": "cine",
    series: "cine",
    "naturaleza y senderismo": "naturaleza",
    senderismo: "naturaleza",
    "astronomia y ciencia": "astronomia",
    "anime y manga": "anime",
    manga: "anime",
    escribir: "escritura",
    "salud mental": "saludmental",
    bienestar: "saludmental",
    noticia: "noticias",
    actualidad: "noticias",
};

function slug(name: string) {
    return name.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();
}

function glyphFor(name: string) {
    const key = slug(name);
    return GLYPHS[ALIASES[key] ?? key];
}

/** The topic's glyph in currentColor, or its emoji when there's no glyph. */
export function TopicGlyph({ name, icon, className }: { name: string; icon?: string | null; className?: string }) {
    const glyph = glyphFor(name);
    if (!glyph) {
        return icon ? <span aria-hidden="true" className={cn("leading-none", className)}>{icon}</span> : null;
    }
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn("size-5 shrink-0", className)}
        >
            {glyph}
        </svg>
    );
}

const BADGE_SIZE = {
    xs: { box: "size-6 rounded-[8px]", glyph: "size-4 text-[13px]" },
    sm: { box: "size-8 rounded-[11px]", glyph: "size-[18px] text-base" },
    md: { box: "size-11 rounded-[15px]", glyph: "size-6 text-xl" },
    lg: { box: "size-14 rounded-[19px]", glyph: "size-7 text-2xl" },
} as const;

/**
 * The topic's glyph on a speech bubble in its logo color (the same color
 * its chip wears everywhere), for tiles, pickers and filter chips.
 */
export function TopicBadge({ name, icon, size = "md", className }: { name: string; icon?: string | null; size?: keyof typeof BADGE_SIZE; className?: string }) {
    const tone = tribeTone(name);
    const s = BADGE_SIZE[size];
    return (
        <span className={cn("flex shrink-0 items-center justify-center text-[oklch(0.2_0.04_265)]", s.box, tone.fill, tone.tail, className)}>
            <TopicGlyph name={name} icon={icon} className={s.glyph} />
        </span>
    );
}
