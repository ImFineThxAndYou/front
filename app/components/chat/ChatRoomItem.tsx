
'use client';

import { ChatRoomSummaryResponse } from '../../../lib/types/chat';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import { formatSimpleTime } from '../../../lib/utils/dateUtils';

interface ChatRoomItemProps {
  room: ChatRoomSummaryResponse;
  isActive: boolean;
  onClick: () => void;
}

export default function ChatRoomItem({ room, isActive, onClick }: ChatRoomItemProps) {
  const { t } = useTranslation('chat');
  
  const formatTime = (instantString: string) => {
    return formatSimpleTime(instantString);
  };

  const getStatusText = () => {
    // 임시로 항상 온라인으로 표시
    return '온라인';
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Show detailed user profile or activity status
    console.log('Show user status details for:', room.opponentName);
  };

  const handleMessagePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open the chat room directly
    onClick();
  };

  return (
    <div
      onClick={onClick}
      className="p-4 cursor-pointer transition-colors border-r-2"
      style={{
        backgroundColor: isActive ? 'var(--accent-primary-alpha)' : 'transparent',
        borderColor: isActive ? 'var(--accent-primary)' : 'transparent'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
            style={{
              background: 'var(--gradient-secondary)',
              color: 'var(--text-on-accent)'
            }}
          >
            {room.opponentName.charAt(0).toUpperCase()}
          </div>
          <div 
            className="absolute -bottom-1 -right-1 w-4 h-4 border-2 rounded-full"
            style={{
              backgroundColor: 'var(--accent-success)',
              borderColor: 'var(--surface-primary)'
            }}
          ></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 
              className="text-sm font-medium truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {room.opponentName}
            </h3>
            {room.lastMessageTime && (
              <span 
                className="text-xs flex-shrink-0 ml-2"
                style={{ color: 'var(--text-quaternary)' }}
              >
                {formatTime(room.lastMessageTime)}
              </span>
            )}
          </div>
          
          <p 
            className="text-xs mb-1 cursor-pointer transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onClick={handleStatusClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            {getStatusText()}
          </p>
          
          {room.lastMessageContent && (
            <div className="flex items-center justify-between">
              <p 
                className="text-sm truncate cursor-pointer transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onClick={handleMessagePreviewClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {room.lastMessageContent}
              </p>
              {room.unreadCount > 0 && (
                <div 
                  className="w-5 h-5 text-xs rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--text-on-accent)'
                  }}
                >
                  {room.unreadCount}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
