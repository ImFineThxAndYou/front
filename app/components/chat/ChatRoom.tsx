
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChatMessageDocumentResponse
} from '../../../lib/types/chat';
import { chatService } from '../../../lib/services/chatService';
import { useAuthStore } from '../../../lib/stores/auth';
import { useChat } from '../../../lib/hooks/useChat';
import { useChatStore } from '../../../lib/stores/chat';
import Avatar from '../ui/Avatar';
import ChatMessage from './ChatMessage';
import { formatDistanceToNow } from '../../../lib/utils/dateUtils';
import { useTranslation } from '../../../lib/hooks/useTranslation';

interface ChatRoomProps {
  roomUuid: string;
  opponentName: string;
  onBack: () => void;
}

export default function ChatRoom({ roomUuid, opponentName, onBack }: ChatRoomProps) {
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { 
    isConnected, 
    isConnecting,
    connectionError,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    currentMessages
  } = useChat();
  const { loadMessages } = useChatStore();
  const { t } = useTranslation('chat');

  // 메시지 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };



  // 초기 메시지 로드
  useEffect(() => {
    console.log('🔍 메시지 로드 useEffect 시작:', { roomUuid, user: !!user });
    
    if (!roomUuid) {
      console.log('❌ roomUuid가 없음:', roomUuid);
      return;
    }

    const loadInitialMessages = async () => {
      try {
        setLoading(true);
        console.log('📥 이전 메시지 로드 시작:', roomUuid);
        
        const messageResponses = await chatService.getRecentMessages(roomUuid, 50);
        console.log('📥 메시지 응답:', messageResponses);
        console.log('📥 응답 타입:', typeof messageResponses, Array.isArray(messageResponses));
        
        if (!Array.isArray(messageResponses)) {
          console.error('❌ 응답이 배열이 아님:', messageResponses);
          return;
        }
        
        // ChatMessageDocumentResponse를 ChatMessage로 변환
        const chatMessages = messageResponses.map(msg => ({
          id: msg.id,
          chatRoomUuid: msg.chatRoomUuid,
          sender: msg.senderName,
          senderId: '', // membername 기반이므로 senderId는 빈 문자열
          senderName: msg.senderName,
          content: msg.content,
          messageTime: msg.messageTime,
          chatMessageStatus: (msg.chatMessageStatus as 'READ' | 'UNREAD') || 'READ'
        }));
        
        console.log('🔄 변환된 메시지들:', chatMessages);
        
        // 스토어에 로드된 메시지들 저장
        console.log('💾 스토어에 메시지 저장 시도...');
        loadMessages(roomUuid, chatMessages);
        console.log(`✅ ${chatMessages.length}개 이전 메시지 로드 완료`);
        
      } catch (error) {
        console.error('❌ 메시지 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialMessages();
  }, [roomUuid]);

  // 채팅방 입장 및 정리 - 안정화된 useEffect
  useEffect(() => {
    if (!user || !roomUuid) return;

    console.log('🔗 ChatRoom: 마운트됨, 채팅방 입장:', roomUuid);

    // 채팅방 입장
    const handleJoinRoom = async () => {
      try {
        await joinChatRoom(roomUuid);
        // 메시지 읽음 처리
        await chatService.markMessagesAsRead(roomUuid);
      } catch (error) {
        console.error('ChatRoom: 채팅방 입장 중 오류:', error);
      }
    };

    handleJoinRoom();

    // 컴포넌트 언마운트 또는 roomUuid 변경 시 정리
    return () => {
      console.log('🚪 ChatRoom: 정리, 채팅방 나가기:', roomUuid);
      leaveChatRoom(roomUuid);
    };
  }, [roomUuid, user?.id]); // 안정적인 의존성만 사용

  // 새 메시지가 추가되면 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !user || sending) {
      console.warn('ChatRoom: 메시지 전송 조건 미충족');
      return;
    }

    console.log('📤 ChatRoom: 메시지 전송 시도:', newMessage.trim());

    try {
      setSending(true);
      await sendMessage(newMessage.trim());
      setNewMessage('');
      console.log('✅ ChatRoom: 메시지 전송 완료');
    } catch (error) {
      console.error('❌ ChatRoom: 메시지 전송 실패:', error);
    } finally {
      setSending(false);
    }
  }, [newMessage, user, sending, sendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div 
        className="flex items-center justify-between p-4 border-b flex-shrink-0"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          
          {/* 디버깅용 연결 버튼 */}
          {!isConnected && (
            <button
              onClick={async () => {
                console.log('🔧 강제 WebSocket 연결 시도');
                try {
                  await joinChatRoom(roomUuid);
                } catch (error) {
                  console.error('❌ 강제 연결 실패:', error);
                }
              }}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              🔧 {t('connectTryAgain')}
            </button>
          )}
          
          <Avatar
            src={undefined}
            alt={opponentName}
            fallback={opponentName}
            size="sm"
          />
          
          <div>
            <h3 
              className="font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {opponentName}
            </h3>
            <div className="flex items-center space-x-2">
              <div 
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}
              />
              <span 
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {isConnected ? t('online') : t('offline')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentMessages.length > 0 && console.log('🔍 렌더링할 메시지들:', currentMessages.map(m => ({ id: m.id, hasId: !!m.id, content: m.content })))}
        {currentMessages.map((message, index) => {
          // 백엔드 응답에 맞게 senderId 또는 senderName 사용
          const isMyMessage = message.senderId === user?.id?.toString() || 
                             message.sender === user?.nickname ||
                             message.sender === user?.membername;
          
          // 안전한 key 생성 (id가 없거나 중복일 경우를 대비)
          const safeKey = message.id || `message-${index}-${message.messageTime}`;
          
          return (
            <ChatMessage
              key={safeKey}
              message={message}
              isOwn={isMyMessage}
              showAvatar={!isMyMessage}
              showTimestamp={true}
              participant={{
                id: message.senderId || message.sender,
                nickname: message.senderName || message.sender,
                avatar: '',
                isOnline: true
              }}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <div 
        className="p-4 border-t flex-shrink-0"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('messagePlaceholder')}
              className="w-full px-4 py-3 rounded-2xl resize-none border focus:outline-none focus:ring-2 focus:ring-purple-500 input-enhanced"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)',
              }}
              rows={1}
              maxLength={500}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending || !isConnected}
            className="p-3 rounded-2xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <i className="ri-send-plane-fill text-lg" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
