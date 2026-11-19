import { TribesShell } from "@/src/app/components/layout/TribesShell";
import { AppSurface } from "@/src/app/components/layout/AppSurface";
import { Metadata } from "next";
import { APP_NAME } from "@/src/app/constants";

export const metadata: Metadata = {
    title: "Tribus",
    description: `Explora y únete a tribus temáticas. Comparte momentos y conoce gente nueva con intereses similares en ${APP_NAME}.`,
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: `Tribus - ${APP_NAME}`,
        description: `Explora y únete a tribus temáticas. Comparte momentos y conoce gente nueva.`,
    },
};

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppSurface className="bg-background text-foreground">
            <TribesShell>{children}</TribesShell>
        </AppSurface>
    );
}