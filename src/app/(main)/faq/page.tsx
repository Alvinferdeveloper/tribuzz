import { Metadata } from "next";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { APP_NAME } from "@/src/app/constants";
import es from "@/src/locales/es.json";
import { FAQ_SECTIONS, stripLinkTags } from "./faq-data";
import { FaqView } from "./FaqView";

export const metadata: Metadata = {
    title: `Preguntas Frecuentes`,
    description: `Encuentra respuestas a las dudas más comunes sobre ${APP_NAME}.`,
};

const copy = es as Record<string, string>;

export default function FAQPage() {
    // Structured data from the same copy the page shows (Spanish, the default).
    const questions = FAQ_SECTIONS.flatMap(section => section.questions).map(id => ({
        '@type': 'Question',
        name: copy[`faq.q.${id}.q`],
        acceptedAnswer: { '@type': 'Answer', text: stripLinkTags(copy[`faq.q.${id}.a`]) },
    }));

    return (
        <>
            <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: questions }} />
            <FaqView />
        </>
    );
}
