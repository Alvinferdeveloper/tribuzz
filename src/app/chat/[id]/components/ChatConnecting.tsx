"use client"
import { Button } from "@shadcn/button";
import { BubbleLoader } from "@/src/components/ui/bubble-loader";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface ChatConnectingProps {
    roomName?: string;
}

export function ChatConnecting({ roomName }: ChatConnectingProps) {
    const { t } = useTranslation();
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 flex flex-col items-center gap-5 text-center">
                <BubbleLoader
                    size="lg"
                    label={roomName ? t('chat.connecting.connecting_to', { topic: roomName }) : t('chat.connecting.connecting_generic')}
                />
                {roomName && (
                    <h1 className="text-2xl font-semibold tracking-tight text-balance">{roomName}</h1>
                )}
                <Button variant="outline" onClick={() => router.push("/tribus")} className="mt-4">
                    {t('chat.connecting.cancel')}
                </Button>
            </div>
        </div>
    );
}
