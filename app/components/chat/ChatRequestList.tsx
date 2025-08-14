'use client';

import { useState, useEffect } from 'react';
import { ChatRequestSummary } from '@/lib/types/chatRequest';
import { chatService } from '@/lib/services/chatService';
import { useAuth } from '@/lib/stores/auth';
import { Button } from '@/app/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ChatRequestListProps {
  type: 'received' | 'sent';
  onRequestUpdate?: () => void;
  onRoomSelect?: (roomId: string) => void;
}

export default function ChatRequestList({ type, onRequestUpdate, onRoomSelect }: ChatRequestListProps) {
  const [requests, setRequests] = useState<ChatRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadRequests();
  }, [type]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: ChatRequestSummary[];
      if (type === 'received') {
        data = await chatService.getMyReceivedChatRequests();
      } else {
        data = await chatService.getMySentChatRequests();
      }
      
      setRequests(data);
    } catch (err) {
      setError('요청 목록을 불러오는데 실패했습니다.');
      console.error('요청 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (roomUuid: string) => {
    if (!user) return;
    
    try {
      await chatService.acceptChatRoom(roomUuid, user.id);
      // 수락 후 목록 새로고침
      await loadRequests();
      // 부모 컴포넌트에 업데이트 알림
      onRequestUpdate?.();
      // 수락된 채팅방 선택
      onRoomSelect?.(roomUuid);
      // 성공 메시지 표시 (간단한 alert)
      alert('채팅 요청을 수락했습니다!');
    } catch (err) {
      console.error('채팅방 수락 실패:', err);
      setError('채팅방 수락에 실패했습니다.');
    }
  };

  const handleReject = async (roomUuid: string) => {
    if (!user) return;
    
    try {
      await chatService.rejectChatRoom(roomUuid, user.id);
      // 거절 후 목록 새로고침
      await loadRequests();
      // 부모 컴포넌트에 업데이트 알림
      onRequestUpdate?.();
      // 성공 메시지 표시 (간단한 alert)
      alert('채팅 요청을 거절했습니다.');
    } catch (err) {
      console.error('채팅방 거절 실패:', err);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadRequests} variant="outline">
          다시 시도
        </Button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        {type === 'received' ? '받은 채팅 요청이 없습니다.' : '보낸 채팅 요청이 없습니다.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.roomUuid}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {request.opponentName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {request.opponentName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(request.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    상태: {request.roomStatus}
                  </p>
                </div>
              </div>
            </div>
            
            {type === 'received' && request.roomStatus === 'PENDING' && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleAccept(request.roomUuid)}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  수락
                </Button>
                <Button
                  onClick={() => handleReject(request.roomUuid)}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  거절
                </Button>
              </div>
            )}
            
            {type === 'sent' && (
              <div className="text-sm text-gray-500">
                {request.roomStatus === 'PENDING' && '대기 중'}
                {request.roomStatus === 'ACCEPTED' && '수락됨'}
                {request.roomStatus === 'REJECTED' && '거절됨'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
