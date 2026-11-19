"use client"
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSocketHandler } from "@/src/app/hooks/useSocketHandler";
import { useJoinRoom } from "@/src/app/hooks/useJoinRoom";
import { useUsername } from "@/src/app/hooks/useUsername";
import { useMessageInput } from "@/src/app/chat/[id]/hooks/useMessageInput";
import { useRoomInfo } from "@/src/app/chat/[id]/hooks/useRoomInfo";
import { useAutoScroll } from "@/src/app/chat/[id]/hooks/useAutoScroll";
import { useImageViewer } from "@/src/app/chat/[id]/hooks/useImageViewer";
import { ChatHeader } from "@/src/app/chat/[id]/components/ChatHeader";
import { MessageList } from "@/src/app/chat/[id]/components/MessageList";
import { MessageInput } from "@/src/app/chat/[id]/components/MessageInput";
import { useFavoriteGifs } from "@/src/app/chat/[id]/hooks/useFavoriteGifs";
import { ChatConnecting } from "@/src/app/chat/[id]/components/ChatConnecting";
import { ImagePreviewModal } from "@/src/app/chat/[id]/components/ImagePreviewModal";
import { ImageViewerModal } from "@/src/app/chat/[id]/components/ImageViewerModal";
import { useImageHandling } from "@/src/app/chat/[id]/hooks/useImageHandling";
import { UserList } from "@/src/app/chat/[id]/components/UserList";
import { ScrollToBottomButton } from "@/src/app/chat/[id]/components/ScrollToBottomButton";
import { TypingIndicator } from "@/src/app/chat/[id]/components/TypingIndicator";
import { useHover } from "@/src/app/hooks/useHover";
import { cn } from "@/src/lib/utils";
import { isTextMessage } from "@/src/types/chat";
import { ConfirmDialog } from "@/src/app/components/shared/ConfirmDialog";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import ChatScene from "@/src/app/chat/[id]/components/ChatScene";
import { TribeRail } from "@/src/app/components/layout/TribeRail";
import { AuthPromptProvider } from "@/src/app/components/auth/AuthPrompt";

export default function ChatPage() {
    const { t } = useTranslation();
    const params = useParams();
    const id = params.id;
    const { username } = useUsername();
    const { connecting } = useJoinRoom(id as string, username);
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const { room } = useRoomInfo(id as string);
    const roomName = room?.name;

    const {
        messages,
        usersInRoom,
        typingUsers,
        startTyping,
        stopTyping,
        sendReaction,
        addOptimisticMessage,
        editingMessage,
        setEditingMessage,
        editMessage,
        deleteMessage
    } = useSocketHandler();

    const {
        newMessage,
        setNewMessage,
        replyingToMessage,
        setReplyingToMessage,
        isMentionListVisible,
        mentionQuery,
        handleSendMessage,
        handleSelectMention,
        cancelEdit
    } = useMessageInput(editingMessage, setEditingMessage, editMessage);

    const { messagesEndRef, scrollToBottom, isNearBottom, unreadCount, jumpToBottom } = useAutoScroll(messages);

    // Single instance of favorites for the entire chat page
    const { favoriteGifs, toggleFavorite, loadingFavorites } = useFavoriteGifs();

    const hasHover = useHover();
    const [isUserListVisible, setIsUserListVisible] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        // Default to visible on desktop, hidden on mobile
        setIsUserListVisible(hasHover);
    }, [hasHover]);

    const {
        previewImage,
        description,
        isModalOpen,
        handleImageSelect,
        handleImageSend,
        setDescription,
        closeModal,
        isUploading,
    } = useImageHandling();

    const { openImageViewer, isImageViewerOpen, viewedImageUrl, closeImageViewer } = useImageViewer()

    if (connecting) {
        return <ChatConnecting roomName={roomName as string | undefined} />;
    }

    const toggleUserList = () => setIsUserListVisible(!isUserListVisible);

    const handleSendImageWithReply = () => {
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
        handleImageSend(replyContext, addOptimisticMessage, username);
    }

    const currentTheme = resolvedTheme || theme;

    return (
        <AuthPromptProvider>
        {/* Desktop: the same tribe rail as the explorer, marking this tribe. */}
        <TribeRail currentRoom={room ? { id: room.id, name: room.name, server_icon: room.server_icon } : undefined} />
        <div className="flex flex-col h-dvh bg-transparent md:pl-[80px]">
            {mounted && (
                <ChatScene
                    theme={currentTheme === "light" ? "day" : "night"}
                    members={usersInRoom}
                    accentName={roomName}
                />
            )}
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 flex flex-col relative">
                    {/* Transparent header floating over the messages and the sky. */}
                    <ChatHeader
                        roomId={id as string}
                        roomName={roomName}
                        room={room}
                        isUserListVisible={isUserListVisible}
                        onToggleUserList={toggleUserList}
                        usersInRoom={usersInRoom}
                        typingUsers={typingUsers}
                    />
                    {/* This wrapper never scrolls itself - it's the fixed anchor for the
                        floating scroll-to-bottom button, which would otherwise move with
                        the content if anchored to the scrollable pane below. */}
                    <div className="relative z-10 flex-1 overflow-hidden">
                        <div className="h-full scrollbar-thin-light [mask-image:linear-gradient(to_bottom,transparent_0,black_72px)]">
                            <MessageList
                                messages={messages}
                                username={username}
                                messagesEndRef={messagesEndRef}
                                scrollToBottom={scrollToBottom}
                                openImageViewer={openImageViewer}
                                usersInRoom={usersInRoom}
                                setReplyingToMessage={setReplyingToMessage}
                                sendReaction={sendReaction}
                                favoriteGifs={favoriteGifs}
                                toggleFavorite={toggleFavorite}
                                onEdit={(msg) => setEditingMessage(msg)}
                                onDelete={(id) => setDeleteConfirmId(id)}
                                room={room}
                            />
                        </div>
                        <ScrollToBottomButton
                            visible={!isNearBottom && messages.length > 0}
                            unreadCount={unreadCount}
                            onClick={jumpToBottom}
                        />
                    </div>
                    <TypingIndicator typingUsers={typingUsers} />
                    <MessageInput
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleSendMessage={handleSendMessage}
                        handleImageSelect={handleImageSelect}
                        replyingToMessage={replyingToMessage}
                        setReplyingToMessage={setReplyingToMessage}
                        usersInRoom={usersInRoom}
                        isMentionListVisible={isMentionListVisible}
                        mentionQuery={mentionQuery}
                        handleSelectMention={handleSelectMention}
                        onStartTyping={startTyping}
                        onStopTyping={stopTyping}
                        favoriteGifs={favoriteGifs}
                        toggleFavorite={toggleFavorite}
                        loadingFavorites={loadingFavorites}
                        editingMessage={editingMessage}
                        cancelEdit={cancelEdit}
                    />
                </main>

                {/* Desktop Sidebar */}
                <aside
                    aria-hidden={!isUserListVisible}
                    className={cn(
                        "hidden md:flex flex-col h-full overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                        isUserListVisible ? "w-[300px]" : "w-0"
                    )}
                >
                    {/* Fixed inner width so the list slides instead of reflowing while the column animates. */}
                    <div className="w-[300px] h-full shrink-0">
                        <UserList users={usersInRoom} typingUsers={typingUsers} roomId={id as string} currentUsername={username} onClose={toggleUserList} />
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {isUserListVisible && !hasHover && (
                    <>
                        <div
                            onClick={toggleUserList}
                            className="fixed inset-0 z-[60] bg-[color:var(--overlay)] animate-in fade-in duration-200"
                        />
                        <aside className="fixed top-0 right-0 z-[70] h-full w-[min(300px,85vw)] bg-background shadow-[-16px_0_40px_-16px_var(--shadow-tint)] animate-in slide-in-from-right duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                            <UserList users={usersInRoom} typingUsers={typingUsers} roomId={id as string} currentUsername={username} onClose={toggleUserList} />
                        </aside>
                    </>
                )}
            </div>
            <ImagePreviewModal
                previewImage={previewImage!}
                description={description}
                isModalOpen={isModalOpen}
                setDescription={setDescription}
                handleImageSend={handleSendImageWithReply}
                closeModal={closeModal}
                isUploading={isUploading}
            />
            <ImageViewerModal
                isOpen={isImageViewerOpen}
                imageUrl={viewedImageUrl}
                onClose={closeImageViewer}
            />
            <ConfirmDialog
                isOpen={deleteConfirmId !== null}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={() => {
                    if (deleteConfirmId) {
                        deleteMessage(deleteConfirmId);
                    }
                    setDeleteConfirmId(null);
                }}
                title={t('chat.confirm_delete.title')}
                description={t('chat.confirm_delete.description')}
                confirmText={t('chat.confirm_delete.confirm')}
                cancelText={t('chat.confirm_delete.cancel')}
                variant="destructive"
            />
        </div>
        </AuthPromptProvider>
    );
}
