/** How long the jumped-to message stays highlighted (matches .message-flash). */
const FLASH_MS = 1400;

/**
 * Scrolls the message pane so the message with `messageId` sits in the
 * middle, then flashes it. Scrolls only the pane (not the page, unlike
 * scrollIntoView, which would also pan the locked chat on iOS).
 * Returns false when the message isn't loaded in the list.
 */
export function scrollToMessage(from: Element, messageId: string): boolean {
    const pane = from.closest('.scrollbar-thin-light') as HTMLElement | null;
    const target = pane?.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(messageId)}"]`);
    if (!pane || !target) return false;

    const offset = target.getBoundingClientRect().top - pane.getBoundingClientRect().top;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pane.scrollTo({
        top: pane.scrollTop + offset - pane.clientHeight / 2 + target.offsetHeight / 2,
        behavior: reduceMotion ? 'instant' : 'smooth',
    });

    target.classList.remove('message-flash');
    // Restart the animation even if it's still running from a previous jump.
    void target.offsetWidth;
    target.classList.add('message-flash');
    window.setTimeout(() => target.classList.remove('message-flash'), FLASH_MS);
    return true;
}
