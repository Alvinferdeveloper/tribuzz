"use client"

import { useEffect, useState, memo } from "react"

function CampfireBackgroundComponent() {
    const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([])

    useEffect(() => {
        const isMobile = window.innerWidth < 768
        const count = isMobile ? 30 : 100
        const newStars = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 50,
            size: Math.random() * 0.15 + 0.05,
            delay: Math.random() * 4,
            duration: Math.random() * 2 + 2,
        }))
        setStars(newStars)
    }, [])

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Navy night sky, the app's base color. Only a faint orange glow near
                the ground hints at the fire's light. */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.16_0.05_266)_0%,oklch(0.15_0.045_265)_50%,oklch(0.13_0.035_262)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(55%_60%_at_50%_100%,oklch(0.65_0.16_50/0.10),transparent_70%)]" />

            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <radialGradient id="skyGlow" cx="50%" cy="20%" r="60%">
                        <stop offset="0%" stopColor="oklch(0.35 0.08 280)" stopOpacity="0.35" />
                        <stop offset="50%" stopColor="#0f172a" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="mountainGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="oklch(0.19 0.045 265)" stopOpacity="1" />
                        <stop offset="100%" stopColor="oklch(0.23 0.045 264)" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="mountainGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="oklch(0.23 0.045 264)" stopOpacity="1" />
                        <stop offset="100%" stopColor="oklch(0.28 0.045 262)" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="cliffGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="oklch(0.11 0.03 265)" stopOpacity="1" />
                        <stop offset="100%" stopColor="oklch(0.14 0.035 265)" stopOpacity="1" />
                    </linearGradient>
                    <filter id="starGlow">
                        <feGaussianBlur stdDeviation="0.1" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <rect width="100" height="100" fill="url(#skyGlow)" />

                {stars.map((star) => (
                    <circle
                        key={star.id}
                        cx={`${star.x}%`}
                        cy={`${star.y}%`}
                        r={star.size}
                        fill="white"
                        className="animate-star-twinkle"
                        style={{
                            animationDuration: `${star.duration}s`,
                            animationDelay: `${star.delay}s`,
                        }}
                    />
                ))}

                <path
                    d="M0 55 Q20 45 40 52 Q60 42 80 50 Q95 45 100 55 L100 100 L0 100 Z"
                    fill="url(#mountainGrad1)"
                    opacity="0.4"
                />

                <path
                    d="M0 65 Q25 55 50 62 Q75 52 100 62 L100 100 L0 100 Z"
                    fill="url(#mountainGrad2)"
                    opacity="0.5"
                />

                <path
                    d="M0 80 Q15 78 30 80 Q50 76 70 79 Q90 77 100 80 L100 100 L0 100 Z"
                    fill="url(#cliffGrad)"
                />
            </svg>

            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    )
}

export default memo(CampfireBackgroundComponent);
