export interface ChatRoom {
  uuid: string;
  roomStatus: string;
  memberId: number;
  memberName: string;
}

export interface ChatMessage {
  id: string;
  chatRoomUuid: string;
  sender: string;
  senderId?: string; // 백엔드 응답에서 추가된 필드
  senderName?: string; // 백엔드 응답에서 추가된 필드
  content: string;
  messageTime: string; // Instant를 ISO string으로 받음
  chatMessageStatus: 'READ' | 'UNREAD';
}

export interface ChatEnterDTO {
  chatRoomId: string;
}

// 채팅 요청 관련 타입
export interface CreateChatRoomRequest {
  membername: string;
}

export interface CreateChatRoomResponse {
  uuid: string;
}

export interface ChatRequestSummaryResponse {
  roomUuid: string;
  opponentId: number;
  opponentName: string;
  roomStatus: string;
  createdAt: string;
}

export enum ChatRoomStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

// 채팅방 관련 타입
export interface ChatRoomResponse {
  uuid: string;
  participants: ChatParticipant[];
  status: ChatRoomStatus;
  createdAt: string;
}

export interface ChatRoomSummaryResponse {
  chatRoomId: string;
  opponentId: number;
  opponentName: string;
  roomStatus: string;
  lastMessageContent?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface ChatParticipant {
  id: number;
  name: string;
  membername: string;
}

// 채팅 메시지 관련 타입
export interface ChatMessageDocumentResponse {
  id: string;
  chatRoomUuid: string;
  senderName: string;
  content: string;
  messageTime: string;
  chatMessageStatus: string;
}

export interface CreateChatMessageRequest {
  chatRoomUuid: string;
  senderId: number | null; // null이면 서버에서 자동 설정
  content: string;
}

export interface ChatMessageResponse {
  id: string;
  chatRoomUuid: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  messageTime: string;
  status: 'UNREAD' | 'READ' | 'DELIVERED';
}

// WebSocket으로 전송할 메시지 요청
export interface WebSocketMessageRequest {
  chatRoomUuid: string;
  senderId: number | null;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE';
}
