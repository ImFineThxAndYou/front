
'use client';

import { useNotification } from '../../../lib/hooks/useNotification';
import NotificationToast from './NotificationToast';

export default function ToastContainer() {
  const { toasts, removeToast } = useNotification();

  console.log('🍞 ToastContainer 렌더링 시작');
  console.log('🍞 toasts 배열:', toasts);
  console.log('🍞 toasts 길이:', toasts.length);

  if (toasts.length === 0) {
    console.log('🍞 토스트가 없음 - null 반환');
    return null;
  }

  console.log('🍞 ToastContainer 실제 렌더링 진행');

  return (
    <div 
      className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none"
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 9999,
        minWidth: '320px',
        maxWidth: '420px'
      }}
    >
      {toasts.map((toast, index) => (
        <div
          key={`toast-${toast.id}`}
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * 8}px)`,
            zIndex: 10000 - index
          }}
        >
          <NotificationToast
            toast={toast}
            onRemove={removeToast}
            index={index}
          />
        </div>
      ))}
    </div>
  );
}
