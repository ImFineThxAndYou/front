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
  content: string;
  messageTime: string; // Instant를 ISO string으로 받음
  chatMessageStatus: 'READ' | 'UNREAD';
}

export interface ChatEnterDTO {
  membername: string;
  chatRoomId: string;
}

export interface CreateChatRoomRequest {
  memberId: number;
  memberName: string;
}

export interface CreateChatRoomResponse {
  chatRoomId: string;
  success: boolean;
}

export interface ChatRoomSummary {
  chatRoomId: string;
  opponentId: number;
  opponentName: string;
  roomStatus: string;
  lastMessageContent?: string;
  lastMessageTime?: string; // Instant를 ISO string으로 받음
  unreadCount: number;
}
