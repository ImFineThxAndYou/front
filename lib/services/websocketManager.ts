import SockJS from 'sockjs-client';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import { ChatMessage, ChatEnterDTO } from '../types/chat';
import { getCurrentInstant } from '../utils/dateUtils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class WebSocketManager {
  private stompClient: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageCallbacks: Map<string, (message: ChatMessage) => void> = new Map();
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  // 싱글톤 패턴
  private static instance: WebSocketManager;
  
  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private constructor() {}

  async connect(): Promise<void> {
    if (this.stompClient?.connected || this.isConnecting) {
      console.log('🔗 WebSocket 이미 연결 중이거나 연결됨');
      return;
    }

    this.isConnecting = true;
    console.log('🔗 WebSocket 연결 시작');

    try {
      // SockJS 연결
      const socket = new SockJS(`${API_BASE_URL}/ws-chatroom`);
      
      // STOMP 클라이언트 생성
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔗 STOMP Debug:', str);
          }
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // 연결 성공 콜백
      this.stompClient.onConnect = () => {
        console.log('✅ WebSocket 연결 성공');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // 기존 구독 복원
        this.restoreSubscriptions();
      };

      // 연결 끊김 콜백
      this.stompClient.onDisconnect = () => {
        console.log('🔌 WebSocket 연결 끊김');
        this.isConnecting = false;
        this.subscriptions.clear();
      };

      // 에러 콜백
      this.stompClient.onStompError = (frame) => {
        console.error('❌ STOMP 에러:', frame);
        this.isConnecting = false;
        this.handleReconnect();
      };

      // 연결 시작
      await this.stompClient.activate();

    } catch (error) {
      console.error('❌ WebSocket 연결 실패:', error);
      this.isConnecting = false;
      this.handleReconnect();
      throw error;
    }
  }

  disconnect(): void {
    console.log('🔌 WebSocket 연결 해제');
    
    // 재연결 타이머 정리
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // 구독 해제
    this.subscriptions.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('❌ 구독 해제 오류:', error);
      }
    });
    this.subscriptions.clear();
    this.messageCallbacks.clear();

    // STOMP 클라이언트 비활성화
    if (this.stompClient?.active) {
      try {
        this.stompClient.deactivate();
      } catch (error) {
        console.error('❌ STOMP 클라이언트 비활성화 오류:', error);
      }
    }

    this.stompClient = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  subscribe(chatRoomId: string, callback: (message: ChatMessage) => void): void {
    if (!this.stompClient?.connected) {
      console.log('⚠️ WebSocket이 연결되지 않음 - 구독 대기');
      this.messageCallbacks.set(chatRoomId, callback);
      return;
    }

    try {
      const destination = `/topic/chatroom/${chatRoomId}`;
      console.log(`📡 채팅방 구독: ${destination}`);

      const subscription = this.stompClient.subscribe(destination, (message: Message) => {
        try {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          console.log('📨 메시지 수신:', chatMessage);
          callback(chatMessage);
        } catch (error) {
          console.error('❌ 메시지 파싱 오류:', error);
        }
      });

      this.subscriptions.set(chatRoomId, subscription);
      this.messageCallbacks.set(chatRoomId, callback);

    } catch (error) {
      console.error('❌ 채팅방 구독 실패:', error);
    }
  }

  unsubscribe(chatRoomId: string): void {
    const subscription = this.subscriptions.get(chatRoomId);
    if (subscription) {
      try {
        subscription.unsubscribe();
        console.log(`📡 채팅방 구독 해제: ${chatRoomId}`);
      } catch (error) {
        console.error('❌ 구독 해제 오류:', error);
      }
      this.subscriptions.delete(chatRoomId);
    }
    this.messageCallbacks.delete(chatRoomId);
  }

  sendMessage(chatRoomId: string, content: string, senderName: string): void {
    if (!this.stompClient?.connected) {
      console.error('❌ WebSocket이 연결되지 않음');
      return;
    }

    try {
      const message = {
        chatRoomUuid: chatRoomId,
        sender: senderName,
        content: content,
        messageTime: getCurrentInstant(),
        chatMessageStatus: 'UNREAD'
      };

      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message)
      });

      console.log('📤 메시지 전송:', message);
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
    }
  }

  enterChatRoom(membername: string, chatRoomId: string): void {
    if (!this.stompClient?.connected) {
      console.error('❌ WebSocket이 연결되지 않음');
      return;
    }

    try {
      const enterDTO: ChatEnterDTO = {
        membername: membername,
        chatRoomId: chatRoomId
      };

      this.stompClient.publish({
        destination: '/app/chat.enter',
        body: JSON.stringify(enterDTO)
      });

      console.log('🚪 채팅방 입장:', enterDTO);
    } catch (error) {
      console.error('❌ 채팅방 입장 실패:', error);
    }
  }

  private restoreSubscriptions(): void {
    console.log('🔄 기존 구독 복원');
    this.messageCallbacks.forEach((callback, chatRoomId) => {
      this.subscribe(chatRoomId, callback);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ 최대 재연결 시도 횟수 초과');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 ${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  isConnected(): boolean {
    return this.stompClient?.connected || false;
  }

  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.stompClient?.connected) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }
}

export const websocketManager = WebSocketManager.getInstance();
