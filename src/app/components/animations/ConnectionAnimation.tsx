"use client"

import { BubbleLoader } from "@/src/components/ui/bubble-loader"

interface ConnectingAnimationProps {
    text: string
}

/** "Connecting…" state, drawn with the brand loader. Kept as a wrapper so existing call sites don't change. */
export function ConnectingAnimation({ text }: ConnectingAnimationProps) {
    return (
        <div className="flex w-full justify-center">
            <BubbleLoader size="md" label={text} />
        </div>
    )
}
