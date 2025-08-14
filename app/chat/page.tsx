
'use client';

import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatRoom from '../components/chat/ChatRoom';
import ChatEmptyState from '../components/chat/ChatEmptyState';
import { useChat } from '../../lib/hooks/useChat';

export default function ChatPage() {
  const { currentChatRoom, isConnected } = useChat();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  


  // API에서 채팅방 데이터 로드
  const { loadChatRooms } = useChat();
  
  useEffect(() => {
    loadChatRooms();
  }, [loadChatRooms]);

  return (
    <MainLayout>
      <div 
        className="flex h-full theme-transition"
        style={{
          background: `linear-gradient(135deg, 
            var(--bg-primary) 0%, 
            var(--bg-secondary) 25%, 
            var(--bg-tertiary) 50%, 
            var(--bg-secondary) 75%, 
            var(--bg-primary) 100%)`
        }}
      >
        {/* Chat Sidebar */}
        <div 
          className="w-80 border-r h-full flex-shrink-0 backdrop-blur-xl theme-transition"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <ChatSidebar 
            selectedRoomId={selectedRoomId}
            onRoomSelect={setSelectedRoomId}
          />
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, var(--accent-primary) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, var(--accent-secondary) 0%, transparent 50%),
                              radial-gradient(circle at 40% 80%, var(--accent-tertiary) 0%, transparent 50%)`
            }}
          />
          
          {selectedRoomId ? (
            <ChatRoom roomId={selectedRoomId} />
          ) : (
            <div className="flex-1 flex items-center justify-center relative z-10 h-full">
              <div 
                className="backdrop-blur-xl rounded-3xl p-12 border shadow-2xl max-w-lg mx-auto relative overflow-hidden theme-transition"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-primary)',
                  boxShadow: 'var(--shadow-xl)'
                }}
              >
                {/* Gradient overlay for the empty state card */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    background: 'var(--gradient-secondary)'
                  }}
                />
                <div className="relative z-10">
                  <ChatEmptyState />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
