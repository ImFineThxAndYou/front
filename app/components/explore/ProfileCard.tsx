
'use client';

import { ProfileResponse } from '../../../lib/types/explore';
import { useState } from 'react';
import Avatar from '../ui/Avatar';
import { chatService } from '../../../lib/services/chatService';
import { useRouter } from 'next/navigation';

interface ProfileCardProps {
  profile: ProfileResponse;
  delay?: number;
}

export default function ProfileCard({ profile, delay = 0 }: ProfileCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const router = useRouter();

  // Ensure profile exists and has required properties
  if (!profile || !profile.membername) {
    return null;
  }

  const handleStartChat = async () => {
    if (!profile.membername) return;
    
    try {
      setIsCreatingChat(true);
      const response = await chatService.createChatRoom({
        membername: profile.membername
      });
      
      // 채팅방 생성 성공 시 채팅 페이지로 이동
      router.push('/chat');
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      // 에러 처리 (토스트 메시지 등)
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div 
      className="animate-in fade-in slide-in-from-bottom duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div 
        className="group backdrop-blur-xl rounded-3xl border p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden h-[420px] flex flex-col"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, var(--surface-secondary) 0%, transparent 100%)',
          }}
        />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 flex-shrink-0">
            <div className="relative">
              <div 
                className="w-16 h-16 rounded-2xl overflow-hidden p-0.5 flex items-center justify-center"
                style={{ backgroundColor: 'var(--surface-tertiary)' }}
              >
                <Avatar
                  src={profile.avatarUrl}
                  alt={profile.nickname || 'User'}
                  fallback={profile.nickname || profile.membername || 'User'}
                  size="lg"
                  className="w-full h-full"
                />
              </div>
              {profile.completed && (
                <div 
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: 'var(--bg-primary)' }}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="w-8 h-8 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-secondary)',
                }}
              >
                <i 
                  className={`${isLiked ? 'ri-heart-fill text-red-500' : 'ri-heart-line'} text-sm`}
                  style={{ color: isLiked ? undefined : 'var(--text-secondary)' }}
                />
              </button>
              <button
                className="w-8 h-8 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-secondary)',
                }}
              >
                <i 
                  className="ri-more-line text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                />
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mb-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h3 
                className="font-semibold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate pr-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {profile.nickname || 'Unknown User'}
              </h3>
              <div 
                className="flex items-center text-xs flex-shrink-0"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <i className="ri-map-pin-line mr-1" />
                {profile.region || 'Unknown'}
              </div>
            </div>
            <p 
              className="text-sm leading-relaxed line-clamp-2 h-10"
              style={{ color: 'var(--text-secondary)' }}
            >
              {profile.bio || 'No bio available'}
            </p>
          </div>

          {/* Language */}
          <div className="mb-4 flex-shrink-0">
            <div className="flex flex-wrap gap-2">
              {profile.language && (
                <span
                  className="px-2 py-1 text-xs rounded-full font-medium border"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-secondary)',
                  }}
                >
                  {profile.language}
                </span>
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="mb-6 flex-grow min-h-0">
            <div className="flex flex-wrap gap-2">
              {(profile.interests || []).slice(0, 3).map((interest, index) => (
                <span
                  key={`${interest}-${index}`}
                  className="px-2 py-1 text-xs rounded-full border"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-secondary)',
                  }}
                >
                  {interest}
                </span>
              ))}
              {(profile.interests || []).length > 3 && (
                <span
                  className="px-2 py-1 text-xs rounded-full border"
                  style={{
                    backgroundColor: 'var(--surface-tertiary)',
                    color: 'var(--text-tertiary)',
                    borderColor: 'var(--border-tertiary)',
                  }}
                >
                  +{profile.interests.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Chat Button */}
          <button 
            onClick={handleStartChat}
            disabled={isCreatingChat}
            className="w-full text-white py-3 px-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg whitespace-nowrap flex items-center justify-center group/btn cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--gradient-secondary)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {isCreatingChat ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                생성 중...
              </>
            ) : (
              <>
                <i className="ri-chat-1-line mr-2 group-hover/btn:scale-110 transition-transform" />
                채팅하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
