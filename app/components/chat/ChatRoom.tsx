
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useChatStore } from '../../../lib/stores/chat';
import { useAuthStore } from '../../../lib/stores/auth';
import { chatService } from '../../../lib/services/chatService';
import ChatMessage from './ChatMessage';
import { useTranslation } from '../../../lib/hooks/useTranslation';

export default function ChatRoom({ roomUuid, opponentName, roomStatus, onBack }: {
  roomUuid: string;
  opponentName: string;
  roomStatus: string; // 채팅방 상태 추가
  onBack: () => void;
}) {
  const { t } = useTranslation('chat');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore();
  const { 
    currentChatRoom,
    isConnecting,
    connectWebSocket,
    sendMessage,
    loadMessages,
    joinChatRoom,
    leaveChatRoom,
    disconnectWebSocket,
    setCurrentChatRoom,
    updateUnreadCount,
    getCurrentMessages
  } = useChatStore();

  // 현재 채팅방의 메시지들
  const currentMessages = getCurrentMessages();

  // 메시지 렌더링 최적화 (단순화)
  const memoizedMessages = useMemo(() => {
    if (!currentMessages) return [];
    
    // 시간순으로 정렬만 수행 (중복 제거는 백엔드에서 처리)
    return currentMessages.sort((a, b) => 
      new Date(a.messageTime).getTime() - new Date(b.messageTime).getTime()
    );
  }, [currentMessages]);

  // 채팅방 상태 확인 (단순화)
  const isPending = roomStatus === 'PENDING';
  const isAccepted = roomStatus === 'ACCEPTED';

  // WebSocket 상태 단순화 (복잡한 enum 제거)
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // 디버깅: 사용자 정보 로깅 (간단하게)
  useEffect(() => {
    console.log('👤 사용자 정보:', {
      userId: user?.id,
      nickname: user?.nickname,
      roomUuid,
      opponentName
    });
  }, [user, roomUuid, opponentName]);

  // 디버깅: 메시지 상태 로깅 (간단하게)
  useEffect(() => {
    if (currentMessages && currentMessages.length > 0) {
      console.log('📥 메시지:', { count: currentMessages.length, roomUuid });
    }
  }, [currentMessages, roomUuid]);

  // 채팅방 입장 시 한 번만 실행되는 플래그
  const hasEnteredRef = useRef(false);

  // 연결 및 구독 함수 (단순화)
  const connectAndSubscribe = useCallback(async () => {
    if (!roomUuid || !user) {
      console.log('❌ 연결 조건 불충족');
      return;
    }

    try {
      console.log('🔗 연결 시작:', roomUuid);
      
      // WebSocket 연결
      await connectWebSocket();
      setIsConnected(true);
      console.log('✅ WebSocket 연결됨');
      
      // 채팅방 구독
      await joinChatRoom(roomUuid);
      setIsSubscribed(true);
      console.log('✅ 방 구독됨');
      
      // 읽음 표시
      await updateUnreadCount(roomUuid, false);
      
    } catch (error) {
      console.error('❌ 연결 실패:', error);
      setIsConnected(false);
      setIsSubscribed(false);
      
      // 3초 후 재시도
      setTimeout(() => {
        if (roomUuid && user) {
          connectAndSubscribe();
        }
      }, 3000);
    }
  }, [roomUuid, user, connectWebSocket, joinChatRoom, updateUnreadCount]);

  // 채팅방 입장 함수 (단순화)
  const enterChatRoom = useCallback(async () => {
    if (!roomUuid || !user || hasEnteredRef.current) {
      return;
    }
    
    try {
      hasEnteredRef.current = true;
      setLoading(true);
      
      if (isAccepted) {
        await connectAndSubscribe();
      } else {
        console.log('⏳ PENDING 상태, 연결 안함');
      }
      
    } catch (error) {
      console.error('❌ 입장 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [roomUuid, user, isAccepted, connectAndSubscribe]);

  // 채팅방 입장 시 한 번만 실행
  useEffect(() => {
    if (roomUuid && user && isAccepted && !hasEnteredRef.current) {
      enterChatRoom();
    }
  }, [roomUuid, user, isAccepted, enterChatRoom]);

  // 메시지 핸들러 등록 (단순화)
  useEffect(() => {
    if (roomUuid && user && isAccepted && isConnected && isSubscribed) {
      const { registerMessageHandler } = useChatStore.getState();
      registerMessageHandler();
    }
  }, [roomUuid, user, isAccepted, isConnected, isSubscribed]);

  // 채팅방 변경 시 입장 플래그 리셋
  useEffect(() => {
    hasEnteredRef.current = false;
    setIsConnected(false);
    setIsSubscribed(false);
  }, [roomUuid]);

  // currentChatRoom 설정 (roomUuid와 동기화)
  useEffect(() => {
    if (roomUuid && currentChatRoom !== roomUuid) {
      console.log('🔍 ChatRoom: currentChatRoom 설정:', { from: currentChatRoom, to: roomUuid });
      setCurrentChatRoom(roomUuid);
    }
  }, [roomUuid, currentChatRoom, setCurrentChatRoom]);

  // currentChatRoom 변경 시 메시지 다시 로드
  useEffect(() => {
    if (currentChatRoom && currentChatRoom === roomUuid) {
      console.log('🔍 ChatRoom: currentChatRoom 변경됨, 메시지 상태 확인:', currentChatRoom);
      const messages = getCurrentMessages();
      console.log('📥 현재 메시지 개수:', messages.length);
    }
  }, [currentChatRoom, roomUuid, getCurrentMessages]);

  // 초기 메시지 로드
  useEffect(() => {
    if (!roomUuid || isPending) return;

    const loadInitialMessages = async () => {
      try {
        setLoading(true);
        console.log('📥 이전 메시지 로드 시작:', roomUuid);
        
        const messageResponses = await chatService.getRecentMessages(roomUuid, 50);
        console.log('📥 메시지 응답:', messageResponses);
        
        if (!Array.isArray(messageResponses)) {
          console.error('❌ 응답이 배열이 아님:', messageResponses);
          return;
        }
        
        // ChatMessageDocumentResponse를 ChatMessage로 변환
        const chatMessages: ChatMessageType[] = messageResponses.map(msg => ({
          id: msg.id,
          chatRoomUuid: msg.chatRoomUuid,
          sender: msg.senderName,
          senderId: msg.senderId || '',
          senderName: msg.senderName,
          content: msg.content,
          messageTime: msg.messageTime,
          chatMessageStatus: (msg.chatMessageStatus as 'READ' | 'UNREAD') || 'READ'
        }));
        
        console.log('📥 변환된 메시지들:', chatMessages);
        
        // 중복 메시지 제거 (임시 메시지와 실제 메시지)
        const { getCurrentMessages } = useChatStore.getState();
        const currentMessages = getCurrentMessages();
        const filteredMessages = chatMessages.filter(newMsg => {
          // 현재 표시된 메시지와 중복 체크
          const isDuplicate = currentMessages.some(currentMsg => 
            currentMsg.id === newMsg.id ||
            (currentMsg.content === newMsg.content && 
             currentMsg.senderId === newMsg.senderId &&
             Math.abs(new Date(currentMsg.messageTime).getTime() - new Date(newMsg.messageTime).getTime()) < 1000) // 1초 이내
          );
          
          if (isDuplicate) {
            console.log('🔍 중복 메시지 필터링:', newMsg.content);
            return false;
          }
          
          return true;
        });
        
        console.log('🔍 필터링 후 메시지:', { original: chatMessages.length, filtered: filteredMessages.length });
        
        // 메시지 로드
        loadMessages(roomUuid, filteredMessages);
        
        // 메시지 로드 후 currentChatRoom 설정 확인 및 강제 설정
        if (currentChatRoom !== roomUuid) {
          console.log('🔍 메시지 로드 후 currentChatRoom 강제 설정:', roomUuid);
          setCurrentChatRoom(roomUuid);
        }
        
        console.log('🔍 ChatRoom: 메시지 로딩 완료 후 상태 확인');
        console.log('📥 로드된 메시지:', chatMessages);
        console.log('📥 메시지 개수:', chatMessages.length);
        console.log('🔍 currentChatRoom 상태:', { current: currentChatRoom, expected: roomUuid });
      } catch (error) {
        console.error('❌ 메시지 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialMessages();
  }, [roomUuid, isPending, loadMessages]);

  // 채팅방 퇴장 시 정리
  useEffect(() => {
    return () => {
      if (roomUuid && user) {
        console.log('🚪 ChatRoom: 채팅방 퇴장, WebSocket 연결 해제');
      leaveChatRoom(roomUuid);
        disconnectWebSocket();
        console.log('🔌 ChatRoom: WebSocket 연결 해제 완료');
      }
    };
  }, [roomUuid, user, leaveChatRoom, disconnectWebSocket]);

  // 새 메시지가 추가되면 스크롤
  useEffect(() => {
    if (currentMessages && currentMessages.length > 0) {
      setTimeout(() => {
    scrollToBottom();
      }, 0);
    }
  }, [currentMessages?.length]);

  // 스크롤 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지 전송 (WebSocket만 사용, 즉시 표시 안함)
  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (!newMessage.trim()) return;

      try {
        setSending(true);
        console.log('📤 메시지 전송:', newMessage);
        
        // 단순한 연결 상태 체크
        if (!isConnected || !isSubscribed) {
          setSendError('연결이 완료되지 않았습니다. 잠시 후 다시 시도해주세요.');
          return;
        }
        
        if (!isAccepted) {
          setSendError('채팅 신청이 수락되지 않았습니다.');
          return;
        }
        
        // 메시지 내용 저장
        const messageContent = newMessage.trim();
        
        // 입력창 초기화 (전송 전에)
        setNewMessage('');
        
        // WebSocket으로만 전송 (화면에는 표시 안함)
        await sendMessage(roomUuid, messageContent);
        console.log('✅ 메시지 전송됨');
        setSendError(null);
        
      } catch (error) {
        console.error('❌ 전송 실패:', error);
        setSendError('메시지 전송에 실패했습니다.');
        // 전송 실패 시 입력창에 메시지 복원
        setNewMessage(newMessage);
      } finally {
        setSending(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">채팅방을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
          <button
            onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <i className="ri-arrow-left-line text-xl mr-2"></i>
          <span className="font-medium">
            {opponentName.includes('@') 
              ? opponentName 
              : `${opponentName}@${opponentName.toLowerCase().replace(/\s+/g, '')}`
            }
          </span>
            </button>
            <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {/* 연결 상태 */}
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-500">
              {isConnected ? '연결됨' : '연결 안됨'}
            </span>
            
            {/* 구독 상태 */}
            {isConnected && (
              <>
                <div className={`w-2 h-2 rounded-full ${
                  isSubscribed ? 'bg-blue-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm text-gray-500">
                  {isSubscribed ? '구독됨' : '구독 중...'}
              </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!memoizedMessages || memoizedMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {loading ? (
              <div className="flex flex-col items-center space-y-2">
                <i className="ri-loader-4-line animate-spin text-2xl"></i>
                <span>메시지를 불러오는 중...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <i className="ri-message-3-line text-2xl text-gray-300"></i>
                <span>아직 메시지가 없습니다.</span>
                {isAccepted && (
                  <span className="text-sm">첫 번째 메시지를 보내보세요!</span>
                )}
                {isPending && (
                  <span className="text-sm">채팅 신청이 수락되면 메시지를 주고받을 수 있습니다.</span>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-400 text-center mb-4">
              {memoizedMessages.length}개의 메시지
            </div>
            {memoizedMessages.map((message) => {
              // 사용자 구별 로직 강화
              const isOwn = (() => {
                console.log('🔍 메시지 분석:', {
                  messageId: message.id,
                  messageSenderId: message.senderId,
                  messageSenderName: message.senderName,
                  messageSender: message.sender,
                  currentUserId: user?.id,
                  currentUserNickname: user?.nickname,
                  currentUserMembername: user?.membername
                });
                
                // 1. senderId로 비교 (가장 정확)
                if (message.senderId && user?.id) {
                  const senderIdMatch = message.senderId === user.id.toString();
                  console.log('🔍 senderId 비교:', { messageSenderId: message.senderId, currentUserId: user.id, match: senderIdMatch });
                  if (senderIdMatch) return true;
                }
                
                // 2. senderName으로 비교 (백업)
                if (message.senderName && user?.nickname) {
                  const senderNameMatch = message.senderName === user.nickname;
                  console.log('🔍 senderName 비교:', { messageSenderName: message.senderName, currentUserNickname: user.nickname, match: senderNameMatch });
                  if (senderNameMatch) return true;
                }
                
                // 3. sender로 비교 (백업)
                if (message.sender && user?.nickname) {
                  const senderMatch = message.sender === user.nickname;
                  console.log('🔍 sender 비교:', { messageSender: message.sender, currentUserNickname: user.nickname, match: senderMatch });
                  if (senderMatch) return true;
                }
                
                // 4. membername으로도 비교 (백업)
                if (message.senderName && user?.membername) {
                  const membernameMatch = message.senderName === user.membername;
                  console.log('🔍 membername 비교:', { messageSenderName: message.senderName, currentUserMembername: user.membername, match: membernameMatch });
                  if (membernameMatch) return true;
                }
                
                // 5. 상대방 이름과 비교하여 상대방 메시지인지 확인
                if (message.senderName === opponentName || message.sender === opponentName) {
                  console.log('🔍 상대방 메시지 확인:', { messageSender: message.senderName || message.sender, opponentName });
                  return false;
                }
                
                console.log('🔍 사용자 구별 실패, 기본값 false');
                return false;
              })();
              
              console.log('🔍 최종 사용자 구별 결과:', {
                messageId: message.id,
                messageSender: message.senderName || message.sender,
                messageSenderId: message.senderId,
                isOwn,
                alignment: isOwn ? '오른쪽 (내 메시지)' : '왼쪽 (상대방 메시지)',
                backgroundColor: isOwn ? '파란색' : '회색'
              });
          
          return (
            <ChatMessage
                  key={message.id}
              message={message}
                  isOwn={isOwn}
                  showAvatar={true}
              showTimestamp={true}
              participant={{
                    id: message.senderId || '',
                    nickname: (() => {
                      if (isOwn) {
                        return user?.nickname || user?.membername || '나';
                      } else {
                        // 상대방인 경우 opponentName 사용
                        return opponentName.includes('@') 
                          ? opponentName 
                          : `${opponentName}@${opponentName.toLowerCase().replace(/\s+/g, '')}`;
                      }
                    })(),
                avatar: '',
                    isOnline: false
              }}
            />
          );
        })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      {isAccepted && (
        <div className="p-4 border-t bg-white">
          <div className="flex items-end space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              disabled={sending}
            />
            <button
              onClick={() => {
                if (newMessage.trim() && !sending) {
                  handleKeyPress({ key: 'Enter', preventDefault: () => {} } as React.KeyboardEvent);
                }
              }}
              disabled={!newMessage.trim() || sending}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {sending ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  <span>전송 중...</span>
                </>
              ) : (
                <>
                  <i className="ri-send-plane-fill"></i>
                  <span>전송</span>
                </>
              )}
            </button>
          </div>
          
          {/* 전송 상태 표시 */}
          {sendError && (
            <div className="mt-2 text-red-500 text-sm">{sendError}</div>
          )}
          
          {/* 전송 안내 메시지 */}
          {!sendError && (
            <div className="mt-2 text-gray-500 text-sm">
              {sending ? '메시지를 전송하고 있습니다...' : 'Enter 키로 메시지를 전송할 수 있습니다.'}
            </div>
          )}
        </div>
      )}

      {isPending && (
        <div className="p-4 border-t bg-gray-50">
          <div className="text-center text-gray-500">
            채팅 신청이 대기 중입니다. 상대방이 수락하면 채팅을 시작할 수 있습니다.
        </div>
      </div>
      )}
    </div>
  );
}
