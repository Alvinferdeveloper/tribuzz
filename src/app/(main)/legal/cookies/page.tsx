import { Metadata } from "next";
import { APP_NAME } from "@/src/app/constants";
import { LegalDocument } from "../LegalDocument";

export const metadata: Metadata = {
    title: "Política de Cookies",
    description: `Información sobre cómo utilizamos las cookies para mejorar tu experiencia en ${APP_NAME}.`,
};

export default function CookiesPage() {
    return <LegalDocument id="cookies" />;
}
