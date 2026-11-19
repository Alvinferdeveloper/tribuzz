'use client'

import Link from 'next/link'
import { Button } from '@/src/components/ui/button'
import { useTranslation } from '@/src/app/lib/i18n'
import { StatusScreen, NIGHT_OUTLINE_BUTTON } from '@/src/app/components/layout/StatusScreen'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <StatusScreen
      variant="lost"
      kicker={t('not_found.kicker')}
      title={t('not_found.title')}
      text={t('not_found.description')}
      speech={t('not_found.speech')}
      illustrationLabel={t('not_found.illustration_label')}
      actions={
        <>
          <Button asChild size="lg" className="h-12 px-6 text-base">
            <Link href="/tribus">{t('not_found.explore')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className={NIGHT_OUTLINE_BUTTON}>
            <Link href="/">{t('not_found.back_home')}</Link>
          </Button>
        </>
      }
    />
  )
}
