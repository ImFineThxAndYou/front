'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'text' | 'full';
}

export default function Logo({ className = '', showText = true, size = 'md', variant = 'icon' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'w-16 h-4',
    md: 'w-24 h-6',
    lg: 'w-32 h-8'
  };

  const fullSizeClasses = {
    sm: 'w-20 h-6',
    md: 'w-32 h-8',
    lg: 'w-48 h-12'
  };

  // 아이콘만 표시
  if (variant === 'icon') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
          <Image
            src="/logo.png"
            alt="HowAreYou Logo"
            width={48}
            height={48}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        
        {/* 로고 텍스트 */}
        {showText && (
          <div className="ml-4 overflow-hidden">
            <h1 className="text-2xl font-['Pacifico'] whitespace-nowrap bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              howareyou
            </h1>
            <p className="text-xs mt-1 whitespace-nowrap text-gray-500">
              언어 학습의 새로운 경험
            </p>
          </div>
        )}
      </div>
    );
  }

  // 텍스트 로고만 표시
  if (variant === 'text') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`relative ${textSizeClasses[size]} flex-shrink-0`}>
          <Image
            src="/text-logo.png"
            alt="HowAreYou Text Logo"
            width={128}
            height={32}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  // 전체 로고 (아이콘 + 텍스트)
  if (variant === 'full') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
          <Image
            src="/logo.png"
            alt="HowAreYou Logo"
            width={48}
            height={48}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        
        <div className={`relative ${textSizeClasses[size]} flex-shrink-0 ml-2`}>
          <Image
            src="/text-logo.png"
            alt="HowAreYou Text Logo"
            width={128}
            height={32}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  return null;
}
