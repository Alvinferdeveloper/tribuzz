'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/src/components/ui/button'
import { useTranslation } from '@/src/app/lib/i18n'
import { StatusScreen, NIGHT_OUTLINE_BUTTON } from '@/src/app/components/layout/StatusScreen'

export default function Error({
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
          <Button asChild variant="outline" size="lg" className={NIGHT_OUTLINE_BUTTON}>
            <Link href="/">{t('error_page.back_home')}</Link>
          </Button>
        </>
      }
      // The digest lets us find this exact error in the server logs.
      footnote={error.digest ? t('error_page.reference', { code: error.digest }) : undefined}
    />
  )
}
