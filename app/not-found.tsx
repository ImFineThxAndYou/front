'use client';

import { useTranslation } from '../lib/hooks/useTranslation';

export default function NotFound() {
  const { t } = useTranslation(['common']);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 
        className="text-5xl md:text-5xl font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        404
      </h1>
      <h1 
        className="text-2xl md:text-3xl font-semibold mt-6"
        style={{ color: 'var(--text-primary)' }}
      >
        {t('common.pageNotFound')}
      </h1>
      <p 
        className="mt-4 text-xl md:text-2xl"
        style={{ color: 'var(--text-secondary)' }}
      >
        {t('common.pageNotFoundDesc')}
      </p>
    </div>
  );
}