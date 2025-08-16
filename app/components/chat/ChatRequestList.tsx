'use client';

import { useState, useEffect } from 'react';
import { ChatRequestSummaryResponse, ChatRoomStatus } from '../../../lib/types/chat';
import { chatService } from '../../../lib/services/chatService';
import Avatar from '../ui/Avatar';
import { formatDistanceToNow } from '../../../lib/utils/dateUtils';

interface ChatRequestListProps {
  onRequestUpdate?: () => void;
}

export default function ChatRequestList({ onRequestUpdate }: ChatRequestListProps) {
  const [sentRequests, setSentRequests] = useState<ChatRequestSummaryResponse[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ChatRequestSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [sentData, receivedData] = await Promise.all([
        chatService.getMySentChatRequests(),
        chatService.getMyReceivedChatRequests()
      ]);
      setSentRequests(sentData);
      setReceivedRequests(receivedData);
    } catch (error) {
      console.error('채팅 요청 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (roomUuid: string, opponentId: number) => {
    try {
      setProcessingId(roomUuid);
      await chatService.acceptChatRoom(roomUuid, opponentId);
      // 수락 후 목록에서 제거
      setReceivedRequests(prev => prev.filter(req => req.roomUuid !== roomUuid));
      onRequestUpdate?.();
    } catch (error) {
      console.error('채팅 요청 수락 실패:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (roomUuid: string, opponentId: number) => {
    try {
      setProcessingId(roomUuid);
      await chatService.rejectChatRoom(roomUuid, opponentId);
      // 거절 후 목록에서 제거
      setReceivedRequests(prev => prev.filter(req => req.roomUuid !== roomUuid));
      onRequestUpdate?.();
    } catch (error) {
      console.error('채팅 요청 거절 실패:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusText = (status: string, isSent: boolean) => {
    switch (status) {
      case 'PENDING':
        return isSent ? '대기 중' : '요청 받음';
      case 'ACCEPTED':
        return '수락됨';
      case 'REJECTED':
        return '거절됨';
      default:
        return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'ACCEPTED':
        return 'text-green-600 dark:text-green-400';
      case 'REJECTED':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTabBadgeCount = (type: 'received' | 'sent') => {
    if (type === 'received') {
      return receivedRequests.filter(req => req.roomStatus === 'PENDING').length;
    } else {
      return sentRequests.filter(req => req.roomStatus === 'PENDING').length;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;
  const hasRequests = receivedRequests.length > 0 || sentRequests.length > 0;

  if (!hasRequests) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400 mb-2">
          <i className="ri-inbox-line text-3xl" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          채팅 요청이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex rounded-xl p-1 bg-gray-100 dark:bg-gray-800">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'received'
              ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          받은 요청
          {getTabBadgeCount('received') > 0 && (
            <span className="ml-2 w-5 h-5 text-xs rounded-full bg-red-500 text-white flex items-center justify-center">
              {getTabBadgeCount('received')}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'sent'
              ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          보낸 요청
          {getTabBadgeCount('sent') > 0 && (
            <span className="ml-2 w-5 h-5 text-xs rounded-full bg-blue-500 text-white flex items-center justify-center">
              {getTabBadgeCount('sent')}
            </span>
          )}
        </button>
      </div>

      {/* Request List */}
      <div className="space-y-3">
        {currentRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeTab === 'received' ? '받은 요청이 없습니다.' : '보낸 요청이 없습니다.'}
            </p>
          </div>
        ) : (
          currentRequests.map((request) => (
            <div
              key={request.roomUuid}
              className="flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar
                  src={undefined}
                  alt={request.opponentName}
                  fallback={request.opponentName}
                  size="md"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 
                      className="font-medium truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {request.opponentName}
                    </h4>
                    <span 
                      className={`text-xs font-medium ${getStatusColor(request.roomStatus)}`}
                    >
                      {getStatusText(request.roomStatus, activeTab === 'sent')}
                    </span>
                  </div>
                  
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {activeTab === 'received' && request.roomStatus === 'PENDING' && (
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleAccept(request.roomUuid, request.opponentId)}
                    disabled={processingId === request.roomUuid}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {processingId === request.roomUuid ? '처리 중...' : '수락'}
                  </button>
                  <button
                    onClick={() => handleReject(request.roomUuid, request.opponentId)}
                    disabled={processingId === request.roomUuid}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {processingId === request.roomUuid ? '처리 중...' : '거절'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
