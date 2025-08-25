
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import Logo from '../Logo';

const navigationItems = [
  { name: 'chat', href: '/chat', icon: 'ri-chat-3-line', activeIcon: 'ri-chat-3-fill' },
  { name: 'explore', href: '/explore', icon: 'ri-compass-line', activeIcon: 'ri-compass-fill' },
  { name: 'wordbook', href: '/wordbook', icon: 'ri-book-line', activeIcon: 'ri-book-fill' },
  { name: 'me', href: '/me', icon: 'ri-user-line', activeIcon: 'ri-user-fill' },

];

interface DesktopNavProps {
  onExpandChange?: (expanded: boolean) => void;
}

export default function DesktopNav({ onExpandChange }: DesktopNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation('nav');
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // 지연된 애니메이션을 위한 타이머
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isHovered) {
      // 호버 시 즉시 확장
      setIsExpanded(true);
    } else {
      // 호버 해제 시 약간의 지연 후 축소
      timeoutId = setTimeout(() => {
        setIsExpanded(false);
      }, 300); // 지연 시간을 조금 늘려서 사용자가 실수로 호버를 벗어났을 때 여유를 줌
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isHovered]);

  // 확장 상태 변경을 부모에게 알림
  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);
  
  // 마우스 이벤트 핸들러
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const shouldShowExpanded = isExpanded;

      return (
      <nav 
        className="hidden lg:flex flex-col backdrop-blur-xl border-r h-screen fixed left-0 top-0 z-30"
        style={{
          width: shouldShowExpanded ? '288px' : '80px',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
          boxShadow: 'var(--shadow-md)'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      {/* 로고 영역 - 고정된 높이 */}
      <div className="h-24 flex items-center border-b px-8" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center w-full">
          {/* 아이콘 로고 - 항상 표시 */}
          <div className="flex-shrink-0">
            <Logo variant="icon" size="md" showText={false} />
          </div>
          
          {/* 텍스트 로고 - 확장 시에만 표시 */}
          <div 
            className="overflow-hidden"
            style={{
              opacity: shouldShowExpanded ? 1 : 0,
              maxWidth: shouldShowExpanded ? '200px' : '0px',
              marginLeft: shouldShowExpanded ? '16px' : '0px',
              transition: 'opacity 0.3s ease-in-out 0.1s, max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Logo variant="text" size="md" />
          </div>
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      <div 
        className="flex-1"
        style={{
          padding: shouldShowExpanded ? '32px 32px 24px 32px' : '24px 20px',
          transition: 'padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="space-y-2">
          {navigationItems.map((item, index) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center rounded-2xl cursor-pointer relative overflow-hidden"
                style={{
                  backgroundColor: 'transparent',
                  padding: shouldShowExpanded ? '8px 12px' : '8px',
                  justifyContent: shouldShowExpanded ? 'flex-start' : 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animationDelay: `${index * 50}ms`
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                    e.currentTarget.style.transform = shouldShowExpanded ? 'translateX(4px)' : 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = shouldShowExpanded ? 'translateX(0)' : 'scale(1)';
                  }
                }}
              >

                
                {/* 펼쳐진 상태에서의 활성 배경 */}
                {isActive && shouldShowExpanded && (
                  <div 
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'var(--surface-tertiary)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  />
                )}

                {/* 아이콘 */}
                <div 
                  className="relative flex-shrink-0 rounded-xl flex items-center justify-center"
                  style={{
                    width: shouldShowExpanded ? '44px' : '40px',
                    height: shouldShowExpanded ? '44px' : '40px',
                    backgroundColor: isActive 
                      ? (shouldShowExpanded ? 'transparent' : 'var(--surface-tertiary)') 
                      : 'var(--surface-secondary)',
                    marginRight: shouldShowExpanded ? '12px' : '0px',
                    boxShadow: isActive && !shouldShowExpanded ? 'var(--shadow-md)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: isActive && !shouldShowExpanded ? '2px solid var(--accent-primary-alpha)' : '2px solid transparent'
                  }}
                >
                  {/* 접힌 상태에서 활성 아이콘의 그라데이션 배경 */}
                  {isActive && !shouldShowExpanded && (
                    <div 
                      className="absolute inset-0 rounded-xl opacity-20"
                      style={{
                        background: 'var(--gradient-secondary)'
                      }}
                    />
                  )}
                  
                  {/* 펼쳐진 상태에서 활성 아이콘의 그라데이션 배경 */}
                  {isActive && shouldShowExpanded && (
                    <div 
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'var(--gradient-secondary)'
                      }}
                    />
                  )}
                  
                  <i 
                    className={`${isActive ? item.activeIcon : item.icon} relative z-10`}
                    style={{
                      color: isActive 
                        ? (shouldShowExpanded ? '#ffffff' : 'var(--accent-primary)')
                        : 'var(--text-secondary)',
                      fontSize: shouldShowExpanded ? '20px' : '18px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                </div>

                {/* 텍스트 - 펼쳐진 상태에서만 표시 */}
                <div 
                  className="relative z-10 flex-1 min-w-0"
                  style={{
                    opacity: shouldShowExpanded ? 1 : 0,
                    transform: shouldShowExpanded ? 'translateX(0)' : 'translateX(-16px)',
                    transition: 'opacity 0.3s ease-in-out 0.1s, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <span 
                    className="font-semibold text-base whitespace-nowrap"
                    style={{
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: isActive ? '600' : '500',
                      transition: 'color 0.3s ease-in-out, font-weight 0.3s ease-in-out'
                    }}
                  >
                    {t(item.name)}
                  </span>
                </div>

                {/* 펼쳐진 상태에서의 오른쪽 라인 표시 */}
                {isActive && shouldShowExpanded && (
                  <div 
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-l-full"
                    style={{
                      background: 'var(--gradient-secondary)',
                      boxShadow: '0 0 8px rgba(var(--accent-primary-rgb), 0.3)'
                    }}
                  />
                )}



                {/* 호버 시 툴팁 (접힌 상태에서만) */}
                {!shouldShowExpanded && (
                  <div 
                    className="absolute left-full ml-2 px-3 py-2 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap"
                    style={{
                      backgroundColor: 'var(--surface-tertiary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {t(item.name)}
                    <div 
                      className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45"
                      style={{
                        backgroundColor: 'var(--surface-tertiary)'
                      }}
                    ></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>


    </nav>
  );
}
