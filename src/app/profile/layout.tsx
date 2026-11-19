import { TribesShell } from "@/src/app/components/layout/TribesShell";
import { AppSurface } from "@/src/app/components/layout/AppSurface";
import { Metadata } from "next";
import { APP_NAME } from "@/src/app/constants";

export const metadata: Metadata = {
    title: "Mi Perfil",
    description: `Administra tu perfil de usuario en ${APP_NAME}. Actualiza tu información y preferencias.`,
    robots: {
        index: false,
        follow: true,
    },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    // Same app frame as /tribus (rail, mobile tab bar, brand surface): the
    // profile is one of the tab bar's destinations, not a separate site.
    return (
        <AppSurface className="bg-background text-foreground">
            <TribesShell>{children}</TribesShell>
        </AppSurface>
    );
}