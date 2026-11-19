import { Metadata } from "next";
import { APP_NAME } from "@/src/app/constants";
import { GuideView } from "./GuideView";

export const metadata: Metadata = {
    title: "Normas de la Comunidad",
    description: `Nuestras reglas para mantener un ambiente seguro y divertido en ${APP_NAME}.`,
};

export default function CommunityGuidePage() {
    return <GuideView />;
}
