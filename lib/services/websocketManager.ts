import { Client, Message, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessageResponse, CreateChatMessageRequest, ChatEnterDTO } from '../types/chat';

export class WebSocketManager {
  private client: Client | null = null;
  private currentChatRoomId: string | null = null;
  private messageHandlers: ((message: ChatMessageResponse) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private subscriptions: Map<string, StompSubscription> = new Map();
  private isConnecting: boolean = false;
  private connectionStateCallback: ((connected: boolean, error?: string) => void) | null = null;

  constructor() {
    // 생성자에서 자동 연결하지 않음
  }

  // STOMP 클라이언트 초기화 및 연결
  async connect(): Promise<void> {
    if (this.client?.connected || this.isConnecting) {
      console.log('🔍 WebSocket: 이미 연결 중이거나 연결됨');
      return;
    }

    this.isConnecting = true;
    console.log('🔗 WebSocket: 연결 시도 시작');

    try {
      // 인증 토큰 가져오기
      const token = localStorage.getItem('accessToken');
      console.log('🔑 WebSocket: 인증 토큰 확인:', token ? '있음' : '없음');
      console.log('🔑 토큰 길이:', token?.length);
      console.log('🔑 토큰 시작 부분:', token?.substring(0, 20) + '...');

      this.client = new Client({
        webSocketFactory: () => {
          // SockJS에 인증 헤더 추가
          const sock = new SockJS('http://localhost:8080/ws-chatroom', null, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          // 연결 시 토큰을 헤더에 추가
          sock.onopen = () => {
            console.log('🔗 SockJS 연결 성공');
          };
          return sock;
        },
        connectHeaders: token ? { 'Authorization': `Bearer ${token}` } : {},
        debug: function (str) {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // 연결 상태 콜백 설정
      this.client.onConnect = () => {
        console.log('✅ STOMP WebSocket 연결 성공');
        console.log('🔗 연결된 클라이언트 정보:', {
          connected: this.client?.connected,
          state: this.client?.state,
          url: this.client?.webSocket?.url
        });
        this.isConnecting = false;
        this.notifyConnectionChange(true);
        if (this.connectionStateCallback) {
          this.connectionStateCallback(true);
        }
      };

      this.client.onDisconnect = () => {
        console.log('🔌 STOMP WebSocket 연결 해제');
        this.isConnecting = false;
        this.notifyConnectionChange(false);
        if (this.connectionStateCallback) {
          this.connectionStateCallback(false);
        }
      };

      this.client.onStompError = (frame) => {
        console.error('❌ STOMP 오류:', frame);
        this.isConnecting = false;
        this.notifyConnectionChange(false);
        if (this.connectionStateCallback) {
          this.connectionStateCallback(false, 'STOMP 오류가 발생했습니다.');
        }
      };

      this.client.onWebSocketError = (error) => {
        console.error('❌ WebSocket 연결 오류:', error);
        this.isConnecting = false;
        this.notifyConnectionChange(false);
        if (this.connectionStateCallback) {
          this.connectionStateCallback(false, 'WebSocket 연결 오류가 발생했습니다.');
        }
      };

      await this.client.activate();
    } catch (error) {
      console.error('❌ STOMP 연결 실패:', error);
      this.isConnecting = false;
      this.notifyConnectionChange(false);
      if (this.connectionStateCallback) {
        this.connectionStateCallback(false, 'STOMP 연결 실패');
      }
      throw error;
    }
  }

  // 연결 상태 콜백 설정
  setConnectionStateCallback(callback: (connected: boolean, error?: string) => void): void {
    this.connectionStateCallback = callback;
  }

  // 연결 해제
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.currentChatRoomId = null;
    this.subscriptions.clear();
    this.notifyConnectionChange(false);
    if (this.connectionStateCallback) {
      this.connectionStateCallback(false);
    }
  }

  // 채팅방 입장 (웹소켓 연결 포함)
  async enterChatRoom(chatRoomId: string): Promise<void> {
    if (this.currentChatRoomId === chatRoomId) {
      console.log('🔍 이미 해당 채팅방에 있음:', chatRoomId);
      return; // 이미 해당 채팅방에 있음
    }

    // 연결이 안되어 있으면 연결
    if (!this.client?.connected) {
      console.log('🔗 WebSocket 연결 시도...');
      await this.connect();
    }

    // 이전 채팅방에서 나가기
    if (this.currentChatRoomId) {
      console.log('🚪 이전 채팅방에서 나가기:', this.currentChatRoomId);
      this.leaveChatRoom();
    }

    try {
      // 채팅방 입장 메시지 전송 (백엔드 ChatEnterDTO 구조에 맞춤)
      const enterMessage: ChatEnterDTO = {
        chatRoomId
      };

      console.log('📤 채팅방 입장 요청 전송:', enterMessage);
      const enterBody = JSON.stringify(enterMessage);
      console.log('📤 실제 전송되는 JSON:', enterBody);
      
      this.client?.publish({
        destination: '/app/chat.enter',
        body: enterBody
      });

      // 메시지 구독
      console.log('📡 채팅방 구독 시작:', chatRoomId);
      const subscription = this.client?.subscribe(`/topic/chatroom/${chatRoomId}`, (message: Message) => {
        try {
          const chatMessage: ChatMessageResponse = JSON.parse(message.body);
          console.log('📨 메시지 수신:', {
            id: chatMessage.id,
            senderName: chatMessage.senderName,
            content: chatMessage.content?.substring(0, 50) + (chatMessage.content?.length > 50 ? '...' : ''),
            messageTime: chatMessage.messageTime
          });
          
          // ChatMessage 형식으로 변환하여 전달
          const convertedMessage = {
            id: chatMessage.id,
            chatRoomUuid: chatMessage.chatRoomUuid,
            sender: chatMessage.senderName, // senderName을 sender로 매핑
            senderId: chatMessage.senderId || '', // senderId가 없을 경우 빈 문자열
            senderName: chatMessage.senderName, // 추가 정보
            content: chatMessage.content,
            messageTime: chatMessage.messageTime,
            chatMessageStatus: (chatMessage.status || 'UNREAD') as 'READ' | 'UNREAD'
          };
          
          console.log('🔄 변환된 메시지:', convertedMessage);
          console.log('🔔 notifyMessageReceived 호출 중...');
          this.notifyMessageReceived(convertedMessage);
          console.log('✅ notifyMessageReceived 호출 완료');
        } catch (error) {
          console.error('❌ 메시지 파싱 오류:', error, 'Raw message:', message.body);
        }
      });

      if (subscription) {
        this.subscriptions.set(chatRoomId, subscription);
      }

      this.currentChatRoomId = chatRoomId;
      console.log('✅ 채팅방 입장 성공:', chatRoomId);
    } catch (error) {
      console.error('❌ 채팅방 입장 실패:', error);
      throw error;
    }
  }

  // 채팅방 나가기
  leaveChatRoom(): void {
    if (this.currentChatRoomId) {
      const subscription = this.subscriptions.get(this.currentChatRoomId);
      if (subscription) {
        subscription.unsubscribe();
        this.subscriptions.delete(this.currentChatRoomId);
      }
      this.currentChatRoomId = null;
      console.log('🚪 채팅방 나가기 완료');
    }
  }

  // 메시지 전송
  sendMessage(chatRoomId: string, content: string): void {
    if (!this.client?.connected) {
      console.error('WebSocket이 연결되지 않았습니다.');
      return;
    }

    // 백엔드 CreateChatMessageRequest 구조에 맞춤
    const message: CreateChatMessageRequest = {
      chatRoomUuid: chatRoomId,
      senderId: null, // 서버에서 자동으로 설정 (null로 보내면 서버가 인증된 사용자 ID로 설정)
      content: content
    };

    console.log('📤 메시지 전송:', message);
    const messageBody = JSON.stringify(message);
    console.log('📤 실제 전송되는 JSON:', messageBody);
    
    this.client.publish({
      destination: '/app/chat.send',
      body: messageBody
    });
  }

  // 메시지 수신 핸들러 등록
  onMessageReceived(handler: (message: ChatMessageResponse) => void): void {
    this.messageHandlers.push(handler);
  }

  // 연결 상태 변경 핸들러 등록
  onConnectionChange(handler: (connected: boolean) => void): void {
    this.connectionHandlers.push(handler);
  }

  // 핸들러 제거
  removeMessageHandler(handler: (message: ChatMessageResponse) => void): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  removeConnectionHandler(handler: (connected: boolean) => void): void {
    this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
  }

  private notifyMessageReceived(message: ChatMessageResponse): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach(handler => handler(connected));
  }

  // 현재 채팅방 ID 반환
  getCurrentChatRoomId(): string | null {
    return this.currentChatRoomId;
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return this.client?.connected || false;
  }

  // 정리
  dispose(): void {
    this.disconnect();
    this.messageHandlers = [];
    this.connectionHandlers = [];
  }
}

// 싱글톤 인스턴스
export const websocketManager = new WebSocketManager();
