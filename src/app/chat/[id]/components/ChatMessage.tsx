"use client"
import { Message, isTextMessage, isImageMessage, isAudioMessage, isGifMessage, Reaction } from "@/src/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { Reply, ChevronRight, SmilePlus, Heart, Megaphone, ShieldCheck, Pencil, Trash2, Copy } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { useLongPress } from "@/src/app/chat/[id]/hooks/useLongPress";
import { useSwipeToReply } from "@/src/app/chat/[id]/hooks/useSwipeToReply";
import { MessageActionMenu, type MessageAction } from "@/src/app/chat/[id]/components/MessageActionMenu";
import { scrollToMessage } from "@/src/app/chat/[id]/utils/scrollToMessage";
import { toast } from "sonner";
import { useHover } from "@/src/app/hooks/useHover";
import { useClickOutside } from "@/src/app/hooks/useClickOutside";
import { ReactionPicker, commonReactions } from "@/src/app/chat/[id]/components/ReactionPicker";
import { ReactionPill } from "@/src/app/chat/[id]/components/ReactionPill";
import { cn } from "@/src/lib/utils";
import { AudioPlayer } from "@/src/app/chat/[id]/components/AudioPlayer";
import { useAuth } from "@/src/app/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { tribeTone } from "@/src/app/utils/tribeColor";
import { BubbleLoader } from "@/src/components/ui/bubble-loader";

interface User {
    id: string;
    username: string;
    profileImage?: string;
}

interface ChatMessageProps {
    msg: Message;
    username: string;
    openImageViewer: (imageUrl: string) => void;
    scrollToBottom: () => void;
    setReplyingToMessage: (message: Message) => void;
    sendReaction: (messageId: string, emoji: string) => void;
    usersInRoom: User[];
    favoriteGifs: any[];
    toggleFavorite: (giphyId: string, url: string, title?: string) => void;
    onEdit?: (message: Message) => void;
    onDelete?: (messageId: string) => void;
    /** False when this message is a same-author, close-in-time continuation
     * of the previous one - hides the repeated avatar/name/time header and
     * tightens spacing, the way Discord/Slack/iMessage group message bursts. */
    isGroupStart?: boolean;
}

// Pinned directly in the hover toolbar so the most common reactions are a
// single click away; the smiley button next to them still opens the full
// picker (commonReactions) for anything else.
const QUICK_REACTIONS = commonReactions.slice(0, 3);

function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const ChatMessage = memo(function ChatMessage({ msg, username, openImageViewer, scrollToBottom, setReplyingToMessage, sendReaction, usersInRoom, favoriteGifs, toggleFavorite, onEdit, onDelete, isGroupStart = true }: ChatMessageProps) {
    const { t } = useTranslation();
    const isMyMessage = msg.username === username;
    const [menuVisible, setMenuVisible] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null);
    // Tracked separately from CSS group-hover: the reactions row is a DOM
    // descendant of the bubble (just visually offset via negative bottom),
    // so hovering a reaction pill would also count as "hovering the message"
    // for group-hover purposes and pop the action toolbar open unintentionally.
    const [isBubbleHovered, setIsBubbleHovered] = useState(false);
    const [isReactionHovered, setIsReactionHovered] = useState(false);
    const messageRef = useRef<HTMLDivElement>(null);
    const desktopPickerRef = useRef<HTMLDivElement>(null);
    const hasHover = useHover();
    const showActionToolbar = hasHover && isBubbleHovered && !isReactionHovered;

    // The mobile long-press menu already closes the picker via its own
    // full-screen backdrop; this only needs to cover the desktop hover
    // toolbar's picker, which had no way to dismiss on an outside click.
    useClickOutside(desktopPickerRef, () => setPickerVisible(false));
    const { session } = useAuth();

    const handleLongPress = (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        const rect = messageRef.current?.getBoundingClientRect();
        if (rect) {
            navigator.vibrate?.(8);
            setMenuAnchor(rect);
            setMenuVisible(true);
        }
    };

    const handleClick = () => {
        if (isImageMessage(msg) && msg.imageUrl) {
            openImageViewer(msg.imageUrl)
        } else if (isGifMessage(msg) && msg.gifUrl) {
            openImageViewer(msg.gifUrl)
        }
    }

    const longPressHandlers = useLongPress(handleLongPress, handleClick, { delay: 300 });

    // Close menu on scroll
    const dismissMenu = useCallback(() => {
        if (menuVisible) {
            setMenuVisible(false);
            setPickerVisible(false);
        }
    }, [menuVisible]);

    useEffect(() => {
        if (!menuVisible) return;

        // Listen to scroll on the nearest scrollable ancestor and window.
        // The actual scroll pane's overflow comes from the .scrollbar-thin-light
        // CSS class, not a literal "overflow-y-*" utility, so match that class
        // directly rather than a substring that never matched it.
        const scrollParent = messageRef.current?.closest('.scrollbar-thin-light') as HTMLElement | null;
        const handler = () => dismissMenu();
        // The long press opens the menu with the finger still down; ignore
        // its jitter and only treat drags made after lifting it as "dismiss".
        let fingerLifted = false;
        const onTouchEnd = () => { fingerLifted = true; };
        const onTouchMove = () => { if (fingerLifted) dismissMenu(); };

        window.addEventListener('scroll', handler, true); // capture phase to catch all scrolls
        scrollParent?.addEventListener('scroll', handler);
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });

        return () => {
            window.removeEventListener('scroll', handler, true);
            scrollParent?.removeEventListener('scroll', handler);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, [menuVisible, dismissMenu]);

    const imageUrl = isImageMessage(msg) ? msg.imageUrl : null;
    const audioUrl = isAudioMessage(msg) ? msg.audioUrl : null;
    const gifUrl = isGifMessage(msg) ? msg.gifUrl : null;

    const getInitials = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    const handleReply = () => {
        setReplyingToMessage(msg);
        setMenuVisible(false);
    };

    const handleReact = (emoji: string) => {
        sendReaction(msg.id, emoji);
        setPickerVisible(false);
        setMenuVisible(false);
    }

    const swipe = useSwipeToReply(handleReply, !hasHover);

    const handleCopy = async () => {
        setMenuVisible(false);
        if (!isTextMessage(msg)) return;
        try {
            await navigator.clipboard.writeText(msg.message);
            toast.success(t('chat.message.copied'));
        } catch {
            toast.error(t('chat.message.copy_failed'));
        }
    };

    // Touch: long press opens the menu, a right swipe replies. Both listen to
    // the same touches; a swipe moves past the long-press threshold, so it
    // cancels the menu on its own.
    const touchHandlers = hasHover ? {} : {
        ...longPressHandlers,
        onTouchStart: (e: React.TouchEvent) => { longPressHandlers.onTouchStart(e); swipe.handlers.onTouchStart(e); },
        onTouchMove: (e: React.TouchEvent) => { longPressHandlers.onTouchMove(e); swipe.handlers.onTouchMove(e); },
        onTouchEnd: (e: React.TouchEvent) => { longPressHandlers.onTouchEnd(e); swipe.handlers.onTouchEnd(); },
        onTouchCancel: swipe.handlers.onTouchCancel,
        onContextMenu: (e: React.MouseEvent) => handleLongPress(e),
    };

    const isGifFavorite = (giphyId: string) => favoriteGifs.some(g => g.giphyId === giphyId);

    const handleToggleGifFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session || !isGifMessage(msg)) return;
        toggleFavorite(msg.giphyId, msg.gifUrl, t('chat.message.gif_label'));
    };

    const highlightMentions = (text: string) => {
        const mentionRegex = /@([a-zA-Z0-9_]+)/g;
        const parts = text.split(mentionRegex);

        return parts.map((part, index) => {
            if (index % 2 === 1) { // This is a username
                const userExists = usersInRoom.some(u => u.username === part);
                const isMe = part === username;
                return (
                    <Link
                        key={index}
                        href={`/profile/${encodeURIComponent(part)}`}
                        className={cn(
                            "font-semibold rounded-md px-1 transition-colors",
                            isMe
                                ? "bg-tribe-sun/45 text-foreground"
                                : userExists
                                    ? (isMyMessage ? "bg-white/20 text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/15")
                                    : (isMyMessage ? "text-primary-foreground/80" : "text-muted-foreground")
                        )}
                    >
                        @{part}
                    </Link>
                );
            }
            return part; // This is a normal text part
        })
    };

    // System and Global Announcement rendering
    if ((msg as any).system) {
        if (msg.joinedUser) {
            const tone = tribeTone(msg.joinedUser);
            return (
                <div className="w-full flex justify-center my-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <div className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-chat-chrome backdrop-blur-md ring-1 ring-border/60 text-[11px] text-muted-foreground font-medium">
                        <span aria-hidden="true" className={cn("size-4 rounded-[45%]", tone.fill, tone.tail)} />
                        {t('chat.user_joined', { username: msg.joinedUser })}
                    </div>
                </div>
            );
        }

        if ((msg as any).isGlobal) {
            return (
                <div
                    className="w-full flex justify-center my-5 px-4 animate-in fade-in duration-500"
                    style={{ animationTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
                >
                    <div className="relative w-full max-w-sm rounded-xl bg-primary/[0.06] ring-1 ring-primary/[0.1] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
                        <div className="relative p-3.5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 shrink-0">
                                    <Megaphone className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/80">
                                    {t('chat.message.official_announcement')}
                                </span>
                                <div className="ml-auto flex items-center gap-1" aria-hidden="true">
                                    <span className="w-1 h-1 rounded-full bg-primary/30" />
                                    <span className="w-1 h-1 rounded-full bg-primary/20" />
                                    <span className="w-1 h-1 rounded-full bg-primary/10" />
                                </div>
                            </div>
                            {isTextMessage(msg) && (
                                <p className="text-sm leading-relaxed text-foreground/85 font-medium">
                                    {msg.message}
                                </p>
                            )}
                            <div className="mt-2.5 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-primary/35" />
                                <time className="text-[10px] text-muted-foreground/50 font-medium tabular-nums">
                                    {formatTime(msg.timestamp)}
                                </time>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full flex justify-center my-2 animate-in fade-in duration-300">
                <div className="px-3 py-1 rounded-full bg-chat-chrome backdrop-blur-md ring-1 ring-border/60 text-[11px] text-muted-foreground font-medium">
                    {isTextMessage(msg) ? msg.message : t('chat.message.system_message')}
                </div>
            </div>
        );
    }

    const hasReactions = Boolean(msg.reactions && msg.reactions.length > 0);

    const messageContent = (
        <div
            ref={messageRef}
            data-message-id={msg.id}
            style={swipe.offset ? { transform: `translateX(${swipe.offset}px)` } : undefined}
            className={cn(
                "max-w-[min(20rem,78vw)] rounded-[1.25rem] text-[0.9375rem] leading-snug md:max-w-md relative self-start",
                !hasHover && "touch-pan-y select-none [-webkit-touch-callout:none]",
                // Snap back smoothly after a swipe; follow the finger 1:1 while dragging.
                !swipe.dragging && "transition-[transform,box-shadow] duration-200 ease-out",
                menuVisible && !hasHover && "scale-[1.03] ring-2 ring-primary/50",
                hasReactions && "mb-4",
                // Speech-bubble shape echoing the logo: the corner pointing at
                // the author tightens on the first bubble of a burst.
                isMyMessage
                    ? cn("bg-primary text-primary-foreground shadow-[0_1px_2px_var(--shadow-tint)]", isGroupStart && "rounded-tr-md")
                    : cn("bg-bubble-other text-bubble-other-foreground ring-1 ring-border/50 shadow-[0_1px_2px_var(--shadow-tint)]", isGroupStart && "rounded-tl-md"),
                isImageMessage(msg) || isGifMessage(msg) ? "p-1" : "px-3.5 py-2"
            )}
            {...touchHandlers}
        >
            {msg.replyTo && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!scrollToMessage(e.currentTarget, msg.replyTo!.id)) toast(t('chat.message.reply_unavailable'));
                    }}
                    aria-label={t('chat.message.jump_to_reply', { username: msg.replyTo.author })}
                    className={cn(
                        "flex w-[calc(100%+0.5rem)] cursor-pointer items-center gap-1.5 mb-1.5 -mx-1 px-2.5 py-1.5 text-left text-xs rounded-xl transition-opacity active:opacity-70",
                        isMyMessage ? "bg-black/12 text-primary-foreground/85" : "bg-muted text-muted-foreground"
                    )}
                >
                    <Reply className="h-3 w-3" />
                    <span className="font-semibold">{t('chat.message.replying_to', { username: msg.replyTo.author })}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="italic truncate max-w-[150px]">{msg.replyTo.messageSnippet}</span>
                </button>
            )}
            {isTextMessage(msg) && <p className="leading-relaxed">{highlightMentions(msg.message)}</p>}

            {/* Image Rendering */}
            {isImageMessage(msg) && imageUrl && (
                <div className="cursor-pointer overflow-hidden rounded-[1rem] relative" onClick={handleClick}>
                    <img
                        src={imageUrl}
                        alt={t('chat.message.image_alt')}
                        className={cn("w-full object-cover", msg.isUploading && "opacity-50")}
                        onLoad={scrollToBottom}
                    />
                    {msg.isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <BubbleLoader size="md" />
                        </div>
                    )}
                    {msg.description && <p className="p-2 text-sm">{msg.description}</p>}
                </div>
            )}

            {/* GIF Rendering */}
            {isGifMessage(msg) && gifUrl && (
                <div className="group/gif cursor-pointer overflow-hidden rounded-[1rem] relative" onClick={handleClick}>
                    <img
                        src={gifUrl}
                        alt={t('chat.message.gif_alt')}
                        className="w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onLoad={scrollToBottom}
                    />

                    {/* Favorite Button (steal GIF) */}
                    {session && (
                        <button
                            onClick={handleToggleGifFavorite}
                            className="absolute cursor-pointer top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md opacity-0 group-hover/gif:opacity-100 transition-opacity hover:bg-black/60"
                            title={isGifFavorite(msg.giphyId) ? t('chat.message.remove_fav') : t('chat.message.steal_gif')}
                        >
                            <Heart className={cn(
                                "h-4 w-4 transition-colors",
                                isGifFavorite(msg.giphyId) ? "fill-tribe-coral text-tribe-coral" : "text-white"
                            )} />
                        </button>
                    )}

                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                        {t('chat.message.gif')}
                    </div>
                </div>
            )}

            {/* Audio Rendering */}
            {isAudioMessage(msg) && audioUrl && (
                <AudioPlayer url={audioUrl} isUploading={msg.isUploading} duration={msg.duration} />
            )}

            {msg.reactions && msg.reactions.length > 0 && (
                <div className={cn(
                    "absolute -bottom-3 flex gap-1 items-center z-10",
                    isMyMessage ? "right-2 flex-row-reverse" : "left-2"
                )}>
                    {msg.reactions.map((reaction: Reaction) => (
                        <ReactionPill
                            key={reaction.emoji}
                            reaction={reaction}
                            isMyMessage={isMyMessage}
                            onReact={handleReact}
                            onHoverChange={setIsReactionHovered}
                        />
                    ))}
                </div>
            )}
            {pickerVisible && hasHover && (
                <div
                    ref={desktopPickerRef}
                    className={cn(
                        "absolute -top-12 z-30 animate-in fade-in zoom-in duration-200",
                        isMyMessage ? "right-0" : "left-0"
                    )}>
                    <ReactionPicker onSelect={handleReact} />
                </div>
            )}
        </div>
    );

    return (
        <>
            <div className={cn(
                "group w-full flex flex-col gap-1",
                isMyMessage ? "items-end" : "items-start",
                isGroupStart ? "mt-4" : "mt-0.5"
            )}>
                {isGroupStart && (
                    <div className={`flex items-center gap-2 ${isMyMessage ? "flex-row-reverse" : "flex-row"}`}>
                        {isMyMessage ? (
                            <Avatar className="h-6 w-6">
                                <AvatarImage
                                    src={msg.userProfileImage || `https://api.dicebear.com/9.x/avataaars/svg?seed=${msg.username}`}
                                    alt={`${msg.username}'s profile picture`}
                                />
                                <AvatarFallback className={cn("text-[10px]", tribeTone(msg.username).soft)}>{getInitials(msg.username)}</AvatarFallback>
                            </Avatar>
                        ) : (
                            <Link href={`/profile/${encodeURIComponent(msg.username)}`}>
                                <Avatar className="h-6 w-6 ring-2 ring-transparent hover:ring-primary/60 transition-[box-shadow] duration-150">
                                    <AvatarImage
                                        src={msg.userProfileImage || `https://api.dicebear.com/9.x/avataaars/svg?seed=${msg.username}`}
                                        alt={`${msg.username}'s profile picture`}
                                    />
                                    <AvatarFallback className={cn("text-[10px]", tribeTone(msg.username).soft)}>{getInitials(msg.username)}</AvatarFallback>
                                </Avatar>
                            </Link>
                        )}
                        {isMyMessage ? (
                            <span className="text-[13px] font-semibold text-primary">{t('chat.message.you')}</span>
                        ) : (
                            <Link
                                href={`/profile/${encodeURIComponent(msg.username)}`}
                                className={cn("text-[13px] font-semibold hover:underline underline-offset-2", tribeTone(msg.username).ink)}
                            >
                                {msg.username}
                            </Link>
                        )}
                        <span className="text-[11px] text-muted-foreground tabular-nums">{formatTime(msg.timestamp)}</span>
                        {msg.edited && <span className="text-[10px] text-muted-foreground/60 italic ml-1">{t('chat.message.edited')}</span>}
                    </div>
                )}

                <div
                    className="relative"
                    onMouseEnter={() => setIsBubbleHovered(true)}
                    onMouseLeave={() => setIsBubbleHovered(false)}
                >
                    {swipe.offset > 0 && (
                        <span
                            aria-hidden="true"
                            className="absolute left-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary/15 text-primary"
                            style={{ opacity: swipe.progress, transform: `translateY(-50%) scale(${0.6 + swipe.progress * 0.4})` }}
                        >
                            <Reply className="size-4" />
                        </span>
                    )}
                    {!isGroupStart && (
                        <time
                            className={cn(
                                "absolute top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out",
                                isMyMessage ? "right-full mr-2" : "left-full ml-2"
                            )}
                        >
                            {formatTime(msg.timestamp)}
                            {msg.edited && <span className="italic ml-1">{t('chat.message.edited')}</span>}
                        </time>
                    )}
                    {hasHover && (
                        <div className={cn(
                            "absolute -top-4 z-20 flex items-center gap-0.5 rounded-full bg-popover ring-1 ring-border/70 shadow-[var(--menu-shadow)] p-0.5 transition-[opacity,transform] duration-150 ease-out",
                            isMyMessage ? "right-2" : "left-2",
                            showActionToolbar ? "opacity-100 translate-y-0" : "opacity-0 translate-y-0.5 pointer-events-none"
                        )}>
                            {QUICK_REACTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReact(emoji)}
                                    className="h-7 w-7 rounded-full flex items-center justify-center text-sm hover:bg-accent transition-[background-color,transform] duration-150 ease-out hover:scale-110 active:scale-95 cursor-pointer"
                                    aria-label={t('chat.message.react_with', { emoji })}
                                >
                                    {emoji}
                                </button>
                            ))}
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full cursor-pointer" onClick={() => setPickerVisible(v => !v)}>
                                <SmilePlus className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full cursor-pointer" onClick={handleReply}>
                                <Reply className="h-3.5 w-3.5" />
                            </Button>
                            {isMyMessage && isTextMessage(msg) && onEdit && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full cursor-pointer" onClick={() => onEdit(msg)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                            )}
                            {isMyMessage && onDelete && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full cursor-pointer hover:text-destructive" onClick={() => onDelete(msg.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    )}
                    {messageContent}
                </div>
            </div>

            {menuVisible && !hasHover && menuAnchor && (
                <MessageActionMenu
                    anchor={menuAnchor}
                    alignEnd={isMyMessage}
                    onReact={handleReact}
                    onClose={dismissMenu}
                    actions={[
                        { id: 'reply', label: t('chat.message.reply'), icon: Reply, onSelect: handleReply },
                        ...(isTextMessage(msg) ? [{ id: 'copy', label: t('chat.message.copy'), icon: Copy, onSelect: handleCopy }] : []),
                        ...(isMyMessage && isTextMessage(msg) && onEdit
                            ? [{ id: 'edit', label: t('chat.message.edit'), icon: Pencil, onSelect: () => { setMenuVisible(false); onEdit(msg); } }]
                            : []),
                        ...(isMyMessage && onDelete
                            ? [{ id: 'delete', label: t('chat.message.delete'), icon: Trash2, destructive: true, onSelect: () => { setMenuVisible(false); onDelete(msg.id); } }]
                            : []),
                    ] satisfies MessageAction[]}
                />
            )}
        </>
    );
});
