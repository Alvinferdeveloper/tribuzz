import { Metadata } from "next";
import { APP_NAME } from "@/src/app/constants";
import { LegalDocument } from "../LegalDocument";

export const metadata: Metadata = {
    title: "Términos de Servicio",
    description: `Lee los términos y condiciones de uso de la plataforma ${APP_NAME}.`,
};

export default function TermsPage() {
    return <LegalDocument id="terms" />;
}
