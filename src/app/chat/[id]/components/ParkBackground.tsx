"use client"

import { useEffect, useState, memo } from "react"

interface Cloud {
    id: number
    y: number
    scale: number
    duration: number
    delay: number
}

/**
 * Light-mode backdrop: a park in the late afternoon. The previous version was
 * a saturated sky-300 sky over a cyan band with a glowing sun, which read as
 * a lightbox behind the messages. Same scene, but low-chroma, slightly warm
 * values and a paper veil on top, so the brand color lives in the
 * conversation (bubbles, names) instead of in the glare.
 */
function ParkBackgroundComponent() {
    const [clouds, setClouds] = useState<Cloud[]>([])

    useEffect(() => {
        const newClouds: Cloud[] = Array.from({ length: 5 }, (_, i) => ({
            id: i,
            y: 6 + Math.random() * 30,
            scale: 0.6 + Math.random() * 1.2,
            duration: 70 + Math.random() * 50,
            delay: Math.random() * -90,
        }))
        setClouds(newClouds)
    }, [])

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Sky: soft blue at the top easing into a warm, hazy horizon */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.87_0.04_235)_0%,oklch(0.915_0.03_215)_38%,oklch(0.945_0.03_95)_62%,oklch(0.93_0.035_120)_100%)]" />

            {/* Low sun: a warm disc with a wide, faint halo. No glow shadow. */}
            <div className="absolute top-[9%] right-[22%] size-56 rounded-full bg-[oklch(0.95_0.07_85)] opacity-50 blur-3xl" />
            <div className="absolute top-[13%] right-[26%] size-14 rounded-full bg-[oklch(0.95_0.08_88)] opacity-80" />

            {clouds.map((cloud) => (
                <div
                    key={cloud.id}
                    className="absolute text-[oklch(0.985_0.006_80)] opacity-60 animate-cloud-drift"
                    style={{
                        top: `${cloud.y}%`,
                        animationDuration: `${cloud.duration}s`,
                        animationDelay: `${cloud.delay}s`,
                    }}
                >
                    <svg width={100 * cloud.scale} height={60 * cloud.scale} viewBox="0 0 100 60">
                        <path
                            fill="currentColor"
                            d="M20,40 Q20,20 40,20 Q45,10 60,10 Q80,10 80,30 Q95,30 95,45 Q95,60 80,60 L20,60 Q5,60 5,45 Q5,30 20,40 Z"
                        />
                    </svg>
                </div>
            ))}

            {/* Hills: sage, receding with lower contrast in the distance */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                    d="M0 60 Q20 50 40 58 Q60 48 80 55 Q95 50 100 60 L100 100 L0 100 Z"
                    fill="oklch(0.86 0.05 140)"
                />
                <path
                    d="M0 70 Q25 60 50 68 Q75 58 100 68 L100 100 L0 100 Z"
                    fill="oklch(0.80 0.07 145)"
                />
                <path
                    d="M0 85 Q15 83 30 85 Q50 81 70 84 Q90 82 100 85 L100 100 L0 100 Z"
                    fill="oklch(0.74 0.075 150)"
                />
            </svg>

            {/* Paper veil: takes the edge off the whole scene and ties it to the
                app's cool neutral, so cards and bubbles sit on it calmly. */}
            <div className="absolute inset-0 bg-[oklch(0.965_0.01_255/0.42)]" />

            <div
                className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    )
}

export default memo(ParkBackgroundComponent);
