'use client'

import { useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { useTranslation } from '@/src/app/lib/i18n'
import { StatusScreen, NIGHT_OUTLINE_BUTTON } from '@/src/app/components/layout/StatusScreen'
import './globals.css'

/**
 * Last-resort error page: it replaces the root layout, so it brings its own
 * <html>, styles and (default-language) copy. Same scene as error.tsx.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="es" className="dark">
      <body>
        <StatusScreen
          variant="fire-out"
          kicker={t('error_page.kicker')}
          title={t('error_page.title')}
          text={t('error_page.description')}
          illustrationLabel={t('error_page.illustration_label')}
          actions={
            <>
              <Button size="lg" className="h-12 px-6 text-base" onClick={() => reset()}>
                {t('error_page.retry')}
              </Button>
              {/* A plain link: the app's router may be what broke. */}
              <Button asChild variant="outline" size="lg" className={NIGHT_OUTLINE_BUTTON}>
                <a href="/">{t('error_page.back_home')}</a>
              </Button>
            </>
          }
          footnote={error.digest ? t('error_page.reference', { code: error.digest }) : undefined}
        />
      </body>
    </html>
  )
}
