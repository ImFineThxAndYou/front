
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/chat', icon: 'ri-chat-3-line', activeIcon: 'ri-chat-3-fill', key: 'chat' },
  { href: '/explore', icon: 'ri-compass-line', activeIcon: 'ri-compass-fill', key: 'explore' },
  { href: '/wordbook', icon: 'ri-book-open-line', activeIcon: 'ri-book-open-fill', key: 'wordbook' },
  { href: '/quiz', icon: 'ri-question-line', activeIcon: 'ri-question-fill', key: 'quiz' },
  { href: '/me', icon: 'ri-user-line', activeIcon: 'ri-user-fill', key: 'me' }
];

export default function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation('nav');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t z-50 theme-transition"
      style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)'
      }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 cursor-pointer`}
              style={{
                color: isActive ? 'var(--info)' : 'var(--text-secondary)'
              }}
            >
              <i className={`${isActive ? item.activeIcon : item.icon} text-xl mb-1`}></i>
              <span className="text-xs font-medium">
                {mounted ? t(item.key) : '...'}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
