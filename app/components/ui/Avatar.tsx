'use client';

import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export default function Avatar({ 
  src, 
  alt, 
  fallback, 
  size = 'md', 
  className = '',
  onClick 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Google 이미지 URL인지 확인
  const isGoogleImage = src?.includes('googleusercontent.com');
  
  // Google 이미지인 경우 일정 시간 후 fallback 표시 (429 에러 방지)
  const [showGoogleFallback, setShowGoogleFallback] = useState(false);
  
  // Google 이미지 로딩 타임아웃 설정
  React.useEffect(() => {
    if (isGoogleImage && src) {
      const timer = setTimeout(() => {
        setShowGoogleFallback(true);
      }, 3000); // 3초 후 fallback 표시
      
      return () => clearTimeout(timer);
    }
  }, [isGoogleImage, src]);
  
  // 이미지 로딩 실패 시 fallback 표시
  const shouldShowFallback = !src || imageError || showGoogleFallback;

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    setShowGoogleFallback(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
    setShowGoogleFallback(true);
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className} relative ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {shouldShowFallback ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl">
          {fallback && fallback.length > 0 ? fallback.charAt(0).toUpperCase() : '?'}
        </div>
      ) : (
        <>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-2xl">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            </div>
          )}
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover rounded-2xl"
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        </>
      )}
    </div>
  );
}
