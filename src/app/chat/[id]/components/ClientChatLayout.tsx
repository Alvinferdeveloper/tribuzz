'use client';

import { useUsername } from '@/src/app/hooks/useUsername';
import { ChatProvider } from '@/src/app/chat/[id]/components/ChatProvider';
import { AppSurface } from '@/src/app/components/layout/AppSurface';

export function ClientChatLayout({ children }: { children: React.ReactNode }) {
    const { username } = useUsername();
    return (
        <AppSurface className="text-foreground">
            <ChatProvider username={username}>
                {children}
            </ChatProvider>
        </AppSurface>
    );
}