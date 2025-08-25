
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
    if (room.roomStatus === 'PENDING') {
      return '수락 대기중';
    }
    return '온라인';
  };

  const getStatusColor = () => {
    if (room.roomStatus === 'PENDING') {
      return 'var(--accent-warning)';
    }
    return 'var(--accent-success)';
  };

  const handleRoomClick = () => {
    if (room.roomStatus === 'PENDING') {
      // PENDING 상태면 클릭 불가
      console.log('❌ PENDING 상태 채팅방은 접근할 수 없습니다:', room.chatRoomId);
      return;
    }
    onClick();
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (room.roomStatus === 'PENDING') {
      console.log('수락 대기중인 채팅방:', room.opponentName);
    } else {
      console.log('Show user status details for:', room.opponentName);
    }
  };

  const handleMessagePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (room.roomStatus === 'PENDING') {
      return; // PENDING 상태면 클릭 불가
    }
    onClick();
  };

  return (
    <div
      onClick={handleRoomClick}
      className={`p-4 transition-colors border-r-2 ${
        room.roomStatus === 'PENDING' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
      style={{
        backgroundColor: isActive ? 'var(--accent-primary-alpha)' : 'transparent',
        borderColor: isActive ? 'var(--accent-primary)' : 'transparent'
      }}
      onMouseEnter={(e) => {
        if (!isActive && room.roomStatus !== 'PENDING') {
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
              background: room.roomStatus === 'PENDING' 
                ? 'var(--surface-tertiary)' 
                : 'var(--gradient-secondary)',
              color: room.roomStatus === 'PENDING' 
                ? 'var(--text-tertiary)' 
                : 'var(--text-on-accent)'
            }}
          >
            {room.roomStatus === 'PENDING' ? '⏳' : room.opponentName.charAt(0).toUpperCase()}
          </div>
          <div 
            className="absolute -bottom-1 -right-1 w-4 h-4 border-2 rounded-full"
            style={{
              backgroundColor: getStatusColor(),
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
              {room.opponentName.includes('@') 
                ? room.opponentName 
                : `${room.opponentName}@${room.opponentName.toLowerCase().replace(/\s+/g, '')}`
              }
              {room.roomStatus === 'PENDING' && (
                <span 
                  className="ml-2 px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: 'var(--accent-warning-bg)',
                    color: 'var(--accent-warning)'
                  }}
                >
                  대기중
                </span>
              )}
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
            className="text-xs mb-1 transition-colors"
            style={{ 
              color: room.roomStatus === 'PENDING' 
                ? 'var(--accent-warning)' 
                : 'var(--text-tertiary)',
              cursor: room.roomStatus === 'PENDING' ? 'default' : 'pointer'
            }}
            onClick={handleStatusClick}
            onMouseEnter={(e) => {
              if (room.roomStatus !== 'PENDING') {
                e.currentTarget.style.color = 'var(--accent-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (room.roomStatus === 'PENDING') {
                e.currentTarget.style.color = 'var(--accent-warning)';
              } else {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
          >
            {getStatusText()}
          </p>
          
          {room.roomStatus === 'PENDING' ? (
            <div className="flex items-center justify-between">
              <p 
                className="text-sm text-gray-500 italic"
                style={{ color: 'var(--text-quaternary)' }}
              >
                채팅 신청이 수락되면 메시지를 주고받을 수 있습니다
              </p>
            </div>
          ) : room.lastMessageContent ? (
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
          ) : (
            <div className="flex items-center justify-between">
              <p 
                className="text-sm text-gray-500 italic"
                style={{ color: 'var(--text-quaternary)' }}
              >
                아직 메시지가 없습니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
