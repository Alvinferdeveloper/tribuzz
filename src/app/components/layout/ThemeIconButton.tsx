"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/src/app/lib/i18n";
import { cn } from "@/src/lib/utils";

/**
 * Compact light/dark toggle (icon only). Shared by the navbar, the tribe rail
 * and the chat header so they all behave the same. Renders an empty slot until
 * mounted, since the resolved theme is only known on the client.
 */
export function ThemeIconButton({ className, iconClassName = "size-5" }: { className?: string; iconClassName?: string }) {
    const { t } = useTranslation();
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const isDark = mounted && resolvedTheme === "dark";

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={t("layout.theme.aria_label")}
            className={cn(
                "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                className
            )}
        >
            {mounted && (isDark ? <Sun className={iconClassName} /> : <Moon className={iconClassName} />)}
        </button>
    );
}
