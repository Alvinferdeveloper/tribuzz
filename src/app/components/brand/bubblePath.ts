/**
 * SVG geometry for the Tribuzz speech bubble: a rounded rectangle whose
 * "tail" corner is nearly square, like the bubbles in the logo. Shared by the
 * characters and the illustrations so every bubble in the brand is the same
 * shape.
 */

export type BubbleCorner = 'tl' | 'tr' | 'br' | 'bl';

/** Rounded rectangle path with an independent radius per corner. */
export function roundedRectPath(x: number, y: number, w: number, h: number, [tl, tr, br, bl]: [number, number, number, number]) {
    return [
        `M${x + tl} ${y}`,
        `H${x + w - tr}`,
        `Q${x + w} ${y} ${x + w} ${y + tr}`,
        `V${y + h - br}`,
        `Q${x + w} ${y + h} ${x + w - br} ${y + h}`,
        `H${x + bl}`,
        `Q${x} ${y + h} ${x} ${y + h - bl}`,
        `V${y + tl}`,
        `Q${x} ${y} ${x + tl} ${y}`,
        'Z',
    ].join(' ');
}

/**
 * A speech bubble: `radius` on three corners, `tailRadius` on the corner the
 * bubble "speaks" from. Radius defaults to 45% of the shorter side, which
 * matches the soft, almost round bubbles of the logo.
 */
export function bubblePath(
    x: number,
    y: number,
    w: number,
    h: number,
    corner: BubbleCorner,
    radius = Math.min(w, h) * 0.45,
    tailRadius = Math.min(w, h) * 0.1,
) {
    const r: [number, number, number, number] = [radius, radius, radius, radius];
    const index = { tl: 0, tr: 1, br: 2, bl: 3 }[corner];
    r[index] = tailRadius;
    return roundedRectPath(x, y, w, h, r);
}
