export interface Notification {
  id: string;
  type: NotificationType;
  payload: string;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
}

export const NotificationType = {
  CHAT: 'CHAT',
  SYSTEM: 'SYSTEM',
  CHATREQ: 'CHATREQ'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// 백엔드 API 응답 타입
export interface NotifyDto {
  id: string;
  type: 'CHAT' | 'SYSTEM' | 'CHATREQ';
  createdAt: string; // Instant를 ISO string으로 받음
  readAt: string | null; // Instant를 ISO string으로 받음, null일 수 있음
  payload: string; // JSON string
}

export interface NotificationPage {
  content: NotifyDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface UnreadCountResponse {
  unread: number;
}

export interface ChatNotificationPayload {
  chatRoomId: number;
  senderId: number;
  preview: string;
  message?: string;
  senderName?: string;
}

export interface SystemNotificationPayload {
  message: string;
}

export interface ChatRequestNotificationPayload {
  requesterId: number;
  requesterName: string;
  message: string;
}

export interface NotificationToast {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isVisible: boolean;
}
