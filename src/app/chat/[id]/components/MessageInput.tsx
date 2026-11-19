"use client"
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Send, Smile, Paperclip, X, Reply as ReplyIcon, Mic, Film, Pencil } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme as EmojiPickerTheme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { Message, isTextMessage, isImageMessage, isAudioMessage } from "@/src/types/chat";
import { MentionList } from "@/src/app/chat/[id]/components/MentionList";
import { useAudioRecording } from "@/src/app/chat/[id]/hooks/useAudioRecording";
import { useSocketHandler } from "@/src/app/hooks/useSocketHandler";
import { useUsername } from "@/src/app/hooks/useUsername";
import VoiceNotePreview from "@/src/app/chat/[id]/components/VoiceNotePreview";
import { formatTime } from "@/src/app/chat/[id]/utils/time";
import { GifPicker } from "./GifPicker";
import { useSocket } from "@/src/app/components/providers/SocketEventProvider";
import { useClickOutside } from "@/src/app/hooks/useClickOutside";
import { useChatSettings } from "@/src/app/chat/[id]/hooks/useChatSettings";
import { cn } from "@/src/lib/utils";
import { useTranslation } from "react-i18next";

interface User {
    id: string;
    username: string;
    profileImage?: string;
}
interface MessageInputProps {
    newMessage: string;
    setNewMessage: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: (e: React.FormEvent) => void;
    handleImageSelect: (file: File) => void;
    replyingToMessage: Message | null;
    setReplyingToMessage: (message: Message | null) => void;
    usersInRoom: User[];
    isMentionListVisible: boolean;
    mentionQuery: string;
    handleSelectMention: (username: string) => void;
    onStartTyping?: () => void;
    onStopTyping?: () => void;
    favoriteGifs: any[];
    toggleFavorite: (giphyId: string, url: string, title?: string) => void;
    loadingFavorites: boolean;
    editingMessage: Message | null;
    cancelEdit: () => void;
}

export function MessageInput({
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleImageSelect,
    replyingToMessage,
    setReplyingToMessage,
    usersInRoom,
    isMentionListVisible,
    mentionQuery,
    handleSelectMention,
    onStartTyping,
    onStopTyping,
    favoriteGifs,
    toggleFavorite,
    loadingFavorites,
    editingMessage,
    cancelEdit
}: MessageInputProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    
    // Reference for closing pickers when clicking outside
    const pickerRef = useRef<HTMLDivElement>(null);
    useClickOutside(pickerRef, () => {
        setShowEmojiPicker(false);
        setShowGifPicker(false);
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { t } = useTranslation();
    const { resolvedTheme } = useTheme();
    const socket = useSocket();
    const { addOptimisticMessage } = useSocketHandler();
    const { username } = useUsername();
    const {
        isRecording,
        recordingTime,
        startRecording,
        stopRecording,
        cancelRecording,
        sendAudioNote,
        audioBlob
    } = useAudioRecording();

    const { chat_gifs_enabled, chat_images_enabled, chat_audio_enabled } = useChatSettings();

    useEffect(() => {
        if (editingMessage) {
            inputRef.current?.focus();
        }
    }, [editingMessage]);

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
        inputRef.current?.focus();
        handleTypingInput();
    };

    const handleGifSelect = (gifUrl: string, giphyId: string) => {
        if (!socket || !username) return;

        const tempId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        let replyContext = undefined;
        if (replyingToMessage) {
            const snippet = isTextMessage(replyingToMessage) 
                ? replyingToMessage.message.substring(0, 50) 
                : t('chat.message.multimedia_fallback');
            
            replyContext = {
                id: replyingToMessage.id,
                author: replyingToMessage.username,
                messageSnippet: snippet
            };
        }

        // Optimistic UI for GIF
        const optimisticGif = {
            id: tempId,
            username: username,
            userProfileImage: null,
            timestamp: new Date().toISOString(),
            gifUrl: gifUrl,
            giphyId: giphyId,
            replyTo: replyContext || null,
            reactions: [],
            isUploading: false
        };
        addOptimisticMessage(optimisticGif as any);

        socket.emit('gif', {
            gifUrl,
            giphyId,
            replyTo: replyContext,
            tempId
        });

        setShowGifPicker(false);
        setReplyingToMessage(null);
    };

    const handleTypingInput = () => {
        if (!isTyping) {
            setIsTyping(true);
            onStartTyping?.();
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            onStopTyping?.();
        }, 2000);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageSelect(file);
        }
        if (e.target) {
            e.target.value = "";
        }
    };

    const handleCancelReply = () => {
        setReplyingToMessage(null);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(e);
        
        // Keep focus on the input so the keyboard doesn't close on mobile.
        inputRef.current?.focus();

        if (isTyping) {
            setIsTyping(false);
            onStopTyping?.();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewMessage(value);
        if (value.trim().length > 0) {
            handleTypingInput();
        } else if (isTyping) {
            setIsTyping(false);
            onStopTyping?.();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    const handleSendAudio = async () => {
        let replyContext = undefined;
        if (replyingToMessage) {
            const messageSnippet = isTextMessage(replyingToMessage)
                ? replyingToMessage.message.substring(0, 50)
                : t('chat.message.image_fallback');

            replyContext = {
                id: replyingToMessage.id,
                author: replyingToMessage.username,
                messageSnippet: messageSnippet.length === 50 ? `${messageSnippet}...` : messageSnippet,
            };
        }
        await sendAudioNote(replyContext, addOptimisticMessage, username);
    };

    return (
        <div className="relative z-30 shrink-0 px-3 sm:px-4 pt-3 pb-[calc(0.75rem+var(--chat-safe-bottom,env(safe-area-inset-bottom,0px)))] border-t border-border/60 bg-chat-chrome backdrop-blur-xl backdrop-saturate-150">
            {editingMessage && (
                <div className="flex items-center justify-between gap-2 mb-2 pl-3 pr-1 py-1 text-sm rounded-2xl bg-primary/10 text-foreground animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="flex items-center gap-2 min-w-0">
                        <Pencil className="h-4 w-4 text-primary shrink-0" />
                        <span>{t('chat.input.editing_message')}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={cancelEdit} className="size-8" aria-label={t('chat.input.cancel_edit')}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {replyingToMessage && !editingMessage && (
                <div className="flex items-center justify-between gap-2 mb-2 pl-3 pr-1 py-1 text-sm rounded-2xl bg-card ring-1 ring-border/60 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="flex items-center gap-2 min-w-0">
                        <ReplyIcon className="h-4 w-4 text-primary shrink-0" />
                        <span>{t('chat.input.replying_to')} <span className="font-semibold">{replyingToMessage.username}</span>:</span>
                        <span className="truncate text-muted-foreground max-w-[200px]">
                            {isTextMessage(replyingToMessage) ? replyingToMessage.message : (isImageMessage(replyingToMessage) ? replyingToMessage.description : (isAudioMessage(replyingToMessage) ? t('chat.message.audio_fallback') : ''))}
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCancelReply} className="size-8" aria-label={t('chat.input.cancel_reply')}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <div className="relative">
                {isMentionListVisible && (
                    <MentionList
                        users={usersInRoom}
                        query={mentionQuery}
                        onSelect={handleSelectMention}
                    />
                )}
                
                {/* Pickers container with click-outside detection */}
                <div ref={pickerRef}>
                    {showEmojiPicker && (
                        <div className="absolute bottom-full mb-2 z-20 origin-bottom-left animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-150">
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                theme={resolvedTheme === 'dark' ? EmojiPickerTheme.DARK : EmojiPickerTheme.LIGHT}
                                className="chat-emoji-picker"
                            />
                        </div>
                    )}
                    
                    {chat_gifs_enabled && showGifPicker && (
                        <div className="absolute bottom-full mb-2 z-20 origin-bottom-left animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-150">
                            <GifPicker
                                onSelect={handleGifSelect}
                                favoriteGifs={favoriteGifs}
                                toggleFavorite={toggleFavorite}
                                loadingFavorites={loadingFavorites}
                            />
                        </div>
                    )}
                </div>

                {/* Voice Note Preview Overlay */}
                {audioBlob && !isRecording && (
                    <VoiceNotePreview
                        recordingTime={recordingTime}
                        cancelRecording={cancelRecording}
                        handleSendAudio={handleSendAudio}
                    />
                )}

                <div className="flex items-center gap-2">
                    {isRecording ? (
                        <div className="flex-1 flex items-center justify-between pl-4 pr-2 h-11 bg-destructive/10 rounded-full">
                            <div className="flex items-center gap-2 text-destructive">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex size-full rounded-full bg-destructive/70 animate-ping motion-reduce:hidden" />
                                    <span className="relative inline-flex size-2 rounded-full bg-destructive" />
                                </span>
                                <span className="text-sm font-semibold tabular-nums">{t('chat.input.recording_label')} {formatTime(recordingTime)}</span>
                            </div>
                            <button
                                onClick={cancelRecording}
                                className="h-8 px-3 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                            >
                                {t('chat.input.cancel_recording')}
                            </button>
                        </div>
                    ) : (
                        <>
                            {chat_images_enabled && (
                                <>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-shrink-0 size-11"
                                        aria-label={t('chat.input.attach_image')}
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={onFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </>
                            )}
                            <div className="relative flex-grow">
                                <Input
                                    ref={inputRef}
                                    value={newMessage}
                                    onChange={onInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey && !isMentionListVisible) {
                                            e.preventDefault();
                                            // Enter that confirms an IME composition (Japanese,
                                            // Chinese, Korean…) must not send; 229 covers Safari.
                                            if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                                            if (newMessage.trim()) {
                                                onSubmit(e as any);
                                            }
                                        }
                                    }}
                                    placeholder={editingMessage ? t('chat.input.edit_placeholder') : t('chat.input.placeholder')}
                                    className="h-11 rounded-full pl-4 pr-22 bg-card dark:bg-card shadow-[0_1px_2px_var(--shadow-tint)] border-border/70"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 px-1">
                                    {chat_gifs_enabled && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setShowGifPicker(!showGifPicker);
                                                setShowEmojiPicker(false);
                                            }}
                                            aria-label={t('chat.input.gif')}
                                            aria-pressed={showGifPicker}
                                            className={cn(
                                                "size-9",
                                                showGifPicker && "text-primary bg-primary/10 hover:text-primary"
                                            )}
                                        >
                                            <Film className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                            setShowEmojiPicker(!showEmojiPicker);
                                            setShowGifPicker(false);
                                        }}
                                        aria-label={t('chat.input.emoji')}
                                        aria-pressed={showEmojiPicker}
                                        className={cn(
                                            "size-9",
                                            showEmojiPicker && "text-primary bg-primary/10 hover:text-primary"
                                        )}
                                    >
                                        <Smile className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex items-center gap-1">
                        {isRecording ? (
                            <Button
                                onClick={() => stopRecording()}
                                className="size-11 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full shrink-0 shadow-none"
                                aria-label={t('chat.input.stop_recording')}
                                size="icon"
                            >
                                <Mic className="h-5 w-5" />
                            </Button>
                        ) : editingMessage ? (
                            <form onSubmit={onSubmit}>
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!newMessage.trim()}
                                    onPointerDown={(e) => e.preventDefault()}
                                    aria-label={t('chat.input.save_edit')}
                                    className={cn(
                                        "flex-shrink-0 size-11 rounded-full active:scale-95 disabled:opacity-100",
                                        newMessage.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground shadow-none"
                                    )}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            </form>
                        ) : chat_audio_enabled && newMessage.trim() === "" ? (
                            <Button
                                type="button"
                                onClick={startRecording}
                                variant="ghost"
                                size="icon"
                                className="size-11 hover:text-primary hover:bg-primary/10 shrink-0"
                                aria-label={t('chat.input.record_voice')}
                            >
                                <Mic className="h-5 w-5" />
                            </Button>
                        ) : (
                            <form onSubmit={onSubmit}>
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!newMessage.trim()}
                                    onPointerDown={(e) => e.preventDefault()} // keep focus on the input so the mobile keyboard stays open
                                    aria-label={t('chat.input.send')}
                                    className={cn(
                                        "flex-shrink-0 size-11 rounded-full active:scale-95 disabled:opacity-100",
                                        newMessage.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground shadow-none"
                                    )}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
