'use client';

import { useNotification } from '../../../lib/hooks/useNotification';

interface SSEStatusIndicatorProps {
  className?: string;
}

export default function SSEStatusIndicator({ className = '' }: SSEStatusIndicatorProps) {
  const { isConnected, connectSSE, disconnectSSE } = useNotification();

  const handleToggleConnection = () => {
    if (isConnected) {
      disconnectSSE();
    } else {
      // 사용자 정보가 필요하므로 실제로는 이 방법으로는 연결할 수 없음
      console.log('🔗 SSE 수동 연결은 사용자 정보가 필요합니다');
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
        <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? 'SSE 연결됨' : 'SSE 연결 끊김'}
        </span>
      </div>
      
      <button
        onClick={handleToggleConnection}
        disabled={!isConnected}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          isConnected 
            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
        }`}
        title={isConnected ? 'SSE 연결 해제' : 'SSE 연결 해제 불가'}
      >
        {isConnected ? '연결 해제' : '연결 해제'}
      </button>
    </div>
  );
}
