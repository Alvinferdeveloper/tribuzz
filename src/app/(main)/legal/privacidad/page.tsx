import { Metadata } from "next";
import { APP_NAME } from "@/src/app/constants";
import { LegalDocument } from "../LegalDocument";

export const metadata: Metadata = {
    title: "Política de Privacidad",
    description: `Conoce cómo manejamos tus datos y protegemos tu privacidad en ${APP_NAME}.`,
};

export default function PrivacyPage() {
    return <LegalDocument id="privacy" />;
}
