import GlobalLayout from "@/src/app/components/layout/GlobalLayout";
import { AppSurface } from "@/src/app/components/layout/AppSurface";
import { Metadata } from "next";
import { APP_NAME } from "@/src/app/constants";

export const metadata: Metadata = {
    title: "Inicio",
    description: `Explora tribus temáticas, conecta con personas y disfruta de una comunidad activa en ${APP_NAME}.`,
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
    // The landing now shares the Tribuzz brand surface with tribus and chat.
    return (
        <AppSurface className="bg-background text-foreground">
            <GlobalLayout>{children}</GlobalLayout>
        </AppSurface>
    );
}