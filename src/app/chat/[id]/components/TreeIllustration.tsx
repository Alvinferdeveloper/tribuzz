"use client"

import { useMemo, memo } from "react"

interface TreeIllustrationProps {
    className?: string
}

function TreeIllustrationComponent({ className = "w-64 h-64" }: TreeIllustrationProps) {
    const leaves = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: 20 + Math.random() * 60,
        y: 10 + Math.random() * 40,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 3,
    })), [])

    return (
        <div className={`relative ${className} flex items-end justify-center overflow-visible`}>
            <svg viewBox="0 0 100 120" className="w-full h-full">
                {/* Trunk */}
                <path
                    d="M45 120 L48 80 Q50 70 52 80 L55 120 Z"
                    fill="oklch(0.45 0.06 55)"
                />

                {/* Foliage (animated sway via CSS) */}
                <g className="animate-tree-sway" style={{ transformOrigin: "50px 100px" }}>
                    <circle cx="50" cy="55" r="35" fill="oklch(0.62 0.09 150)" />
                    <circle cx="35" cy="45" r="25" fill="oklch(0.56 0.085 152)" />
                    <circle cx="65" cy="45" r="25" fill="oklch(0.56 0.085 152)" />
                    <circle cx="50" cy="30" r="20" fill="oklch(0.74 0.1 140)" opacity="0.7" />
                </g>

                {/* Falling Leaves */}
                {leaves.map((leaf) => (
                    <path
                        key={leaf.id}
                        d="M0 0 C2 5 8 5 10 0 C8 -5 2 -5 0 0 Z"
                        fill="oklch(0.72 0.1 140)"
                        className="opacity-60 animate-leaf-fall"
                        style={{
                            transformOrigin: `${leaf.x}px ${leaf.y}px`,
                            animationDuration: `${leaf.duration}s`,
                            animationDelay: `${leaf.delay}s`,
                        }}
                    />
                ))}
            </svg>
        </div>
    )
}

export default memo(TreeIllustrationComponent);
