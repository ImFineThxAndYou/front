import { Client, Message, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessageResponse, CreateChatMessageRequest, ChatEnterDTO, ChatMessage } from '../types/chat';
import { authService } from './auth';

export class WebSocketManager {
  private client: Client | null = null;
  private currentChatRoomId: string | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
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
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      this.client = new Client({
        webSocketFactory: () => {
          // SockJS에 인증 헤더 추가
          const wsBaseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || 'http://localhost:8080';
          const sock = new SockJS(`${wsBaseUrl}/ws-chatroom`, null, {
            headers: { 'Authorization': `Bearer ${token}` },
            transports: ['websocket'], // websocket만 사용하여 무한 요청 방지
            timeout: 10000, // 타임아웃 단축
          });
          return sock;
        },
        connectHeaders: { 'Authorization': `Bearer ${token}` },
        debug: function (str) {
          // 디버그 로그 제한
          if (str.includes('CONNECT') || str.includes('CONNECTED') || str.includes('ERROR')) {
            console.log('STOMP Debug:', str);
          }
        },
        reconnectDelay: 0, // 자동 재연결 비활성화
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectionTimeout: 10000, // 타임아웃 단축
        heartbeatGracePeriod: 5000,
      });

      // 연결 상태 콜백 설정
      this.client.onConnect = () => {
        console.log('✅ STOMP WebSocket 연결 성공');
        this.isConnecting = false;
        this.notifyConnectionChange(true);
        if (this.connectionStateCallback) {
          this.connectionStateCallback(true);
        }
        
        // 연결 상태 로그 출력 (null 체크 추가)
        if (this.client) {
          console.log('🔍 WebSocket 연결 후 상태:', {
            hasClient: !!this.client,
            stompConnected: this.client.connected,
            stompState: this.client.state,
            isConnecting: this.isConnecting
          });
        } else {
          console.log('🔍 WebSocket 연결 후 상태: 클라이언트가 null임');
        }
      };

      this.client.onDisconnect = () => {
        console.log('🔌 STOMP WebSocket 연결 해제');
        this.isConnecting = false;
        this.notifyConnectionChange(false);
        if (this.connectionStateCallback) {
          this.connectionStateCallback(false);
        }
        
        // 연결 해제 시 자동 재연결 시도 (무한 루프 방지)
        if (!this.isConnecting) {
          console.log('🔄 WebSocket: 연결 해제 후 자동 재연결 시도 (1초 후)');
          setTimeout(() => {
            if (!this.client?.connected && !this.isConnecting) {
              this.connect();
            }
          }, 1000);
        }
      };

      this.client.onStompError = (frame) => {
        console.error('❌ STOMP 오류:', frame);
        this.isConnecting = false;
        this.notifyConnectionChange(false);
        if (this.connectionStateCallback) {
          this.connectionStateCallback(false, `STOMP 오류: ${frame.headers?.message || '알 수 없는 오류'}`);
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

      // STOMP 연결 활성화 및 완료 대기
      console.log('🔄 STOMP 클라이언트 활성화 시작...');
      await this.client.activate();
      
      // 연결 완료까지 대기 (최대 10초)
      let attempts = 0;
      const maxAttempts = 100; // 100ms * 100 = 10초
      
      while (attempts < maxAttempts && this.client && !this.client.connected) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
        
        if (attempts % 10 === 0) { // 1초마다 로그
          console.log(`⏳ WebSocket 연결 대기 중... (${attempts * 100}ms)`);
        }
      }
      
      if (!this.client || !this.client.connected) {
        throw new Error('WebSocket 연결 타임아웃');
      }
      
      console.log('✅ WebSocket 연결 완료 확인됨');
      
    } catch (error) {
      console.error('❌ STOMP 연결 실패:', error);
      this.isConnecting = false;
      this.notifyConnectionChange(false);
      if (this.connectionStateCallback) {
        this.connectionStateCallback(false, `STOMP 연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
      
      // 연결 실패 시 자동 재연결 시도 (무한 루프 방지)
      if (!this.isConnecting) {
        console.log('🔄 WebSocket: 자동 재연결 시도 (2초 후)');
        setTimeout(() => {
          if (!this.client?.connected && !this.isConnecting) {
            this.connect();
          }
        }, 2000);
      }
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
    console.log('🚪 enterChatRoom 시작:', chatRoomId);
    console.log('🔍 현재 상태:', {
      currentChatRoomId: this.currentChatRoomId,
      hasClient: !!this.client,
      clientConnected: this.client?.connected,
      clientState: this.client?.state
    });
    
    if (this.currentChatRoomId === chatRoomId) {
      console.log('🔍 이미 해당 채팅방에 있음:', chatRoomId);
      return; // 이미 해당 채팅방에 있음
    }

    // 연결이 안되어 있으면 연결
    if (!this.client?.connected) {
      console.log('🔗 WebSocket 연결 시도...');
      await this.connect();
      console.log('✅ WebSocket 연결 완료');
    } else {
      console.log('🔗 WebSocket 이미 연결됨');
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
      
      if (!this.client) {
        throw new Error('WebSocket 클라이언트가 초기화되지 않았습니다.');
      }
      
      console.log('📤 /app/chat.enter로 메시지 전송 시도...');
      this.client.publish({
        destination: '/app/chat.enter',
        body: enterBody
      });
      console.log('✅ /app/chat.enter 메시지 전송 완료');

      // 메시지 구독
      console.log('📡 채팅방 구독 시작:', chatRoomId);
      console.log('📡 구독 대상 토픽:', `/topic/chatroom/${chatRoomId}`);
      
      const subscription = this.client.subscribe(`/topic/chatroom/${chatRoomId}`, (message: Message) => {
        console.log('📨 구독된 메시지 수신:', message);
        try {
          const chatMessage: ChatMessageResponse = JSON.parse(message.body);
          console.log('📨 메시지 수신:', {
            id: chatMessage.id,
            senderName: chatMessage.senderName,
            content: chatMessage.content?.substring(0, 50) + (chatMessage.content?.length > 50 ? '...' : ''),
            messageTime: chatMessage.messageTime
          });
          
          // ChatMessage 형식으로 변환하여 전달
          const convertedMessage: ChatMessage = {
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
        console.log('📡 구독 객체 생성 성공:', subscription);
        this.subscriptions.set(chatRoomId, subscription);
        console.log('📡 구독 맵에 저장 완료:', chatRoomId);
      } else {
        console.error('❌ 구독 객체 생성 실패');
      }

      this.currentChatRoomId = chatRoomId;
      console.log('✅ 채팅방 입장 성공:', chatRoomId);
      console.log('🔍 최종 상태:', {
        currentChatRoomId: this.currentChatRoomId,
        subscriptionsSize: this.subscriptions.size,
        hasClient: !!this.client,
        clientConnected: this.client?.connected
      });
    } catch (error) {
      console.error('❌ 채팅방 입장 실패:', error);
      throw error;
    }
  }

  // 채팅방 나가기
  leaveChatRoom(): void {
    if (this.currentChatRoomId) {
      console.log('🚪 채팅방 나가기 시작:', this.currentChatRoomId);
      
      // 해당 채팅방 구독 해제
      const subscription = this.subscriptions.get(this.currentChatRoomId);
      if (subscription) {
        subscription.unsubscribe();
        this.subscriptions.delete(this.currentChatRoomId);
        console.log('📡 채팅방 구독 해제 완료:', this.currentChatRoomId);
      }
      
      // 현재 채팅방 ID 초기화
      this.currentChatRoomId = null;
      console.log('🚪 채팅방 나가기 완료');
    }
  }

  // 메시지 전송
  sendMessage(chatRoomId: string, content: string): void {
    if (!this.client) {
      console.error('❌ WebSocket 클라이언트가 초기화되지 않았습니다.');
      throw new Error('WebSocket 클라이언트가 초기화되지 않았습니다.');
    }
    
    if (!this.client.connected) {
      console.error('❌ WebSocket이 연결되지 않았습니다. 연결 상태:', {
        hasClient: !!this.client,
        isConnected: this.client.connected,
        state: this.client.state
      });
      throw new Error('WebSocket이 연결되지 않았습니다.');
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
  onMessageReceived(handler: (message: ChatMessage) => void): void {
    // 중복 등록 방지
    if (!this.messageHandlers.includes(handler)) {
      this.messageHandlers.push(handler);
      console.log('🔔 메시지 핸들러 등록됨, 총 핸들러 수:', this.messageHandlers.length);
    } else {
      console.log('🔔 메시지 핸들러가 이미 등록되어 있음');
    }
  }

  // 연결 상태 변경 핸들러 등록
  onConnectionChange(handler: (connected: boolean) => void): void {
    this.connectionHandlers.push(handler);
  }

  // 핸들러 제거
  removeMessageHandler(handler: (message: ChatMessage) => void): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  removeConnectionHandler(handler: (connected: boolean) => void): void {
    this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
  }

  private notifyMessageReceived(message: ChatMessage): void {
    console.log('🔔 notifyMessageReceived 호출됨:', {
      messageId: message.id,
      messageContent: message.content?.substring(0, 30),
      registeredHandlers: this.messageHandlers.length
    });
    
    if (this.messageHandlers.length === 0) {
      console.warn('⚠️ 등록된 메시지 핸들러가 없습니다!');
      return;
    }
    
    this.messageHandlers.forEach((handler, index) => {
      console.log(`🔔 핸들러 ${index + 1} 호출 중...`);
      try {
        handler(message);
        console.log(`✅ 핸들러 ${index + 1} 호출 완료`);
      } catch (error) {
        console.error(`❌ 핸들러 ${index + 1} 호출 실패:`, error);
      }
    });
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach(handler => handler(connected));
  }

  // 현재 채팅방 ID 반환
  getCurrentChatRoomId(): string | null {
    return this.currentChatRoomId;
  }

  // 특정 채팅방에 구독되어 있는지 확인
  isSubscribedToRoom(chatRoomId: string): boolean {
    return this.subscriptions.has(chatRoomId);
  }

  // 구독된 채팅방 목록 반환
  getSubscribedRooms(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  // 연결 상태 확인
  isConnected(): boolean {
    // 클라이언트가 없으면 연결되지 않음
    if (!this.client) {
      console.log('🔍 WebSocket 연결 상태 확인: 클라이언트 없음');
      return false;
    }
    
    // STOMP 클라이언트의 연결 상태 확인
    const stompConnected = this.client.connected;
    const stompState = this.client.state;
    
    // STOMP 상태를 문자열로 변환
    let stateString = 'UNKNOWN';
    switch (stompState) {
      case 0: stateString = 'CONNECTING'; break;
      case 1: stateString = 'OPEN'; break;
      case 2: stateString = 'CLOSING'; break;
      case 3: stateString = 'CLOSED'; break;
      default: stateString = `UNKNOWN(${stompState})`; break;
    }
    
    console.log('🔍 WebSocket 연결 상태 확인:', {
      hasClient: !!this.client,
      stompConnected,
      stompState: stateString,
      isConnecting: this.isConnecting
    });
    
    // STOMP connected가 true이면 연결된 것으로 간주
    // stompState는 WebSocket의 상태이므로 STOMP 연결과는 별개일 수 있음
    if (stompConnected) {
      return true;
    }
    
    // 연결 시도 중이거나 오류 상태는 false 반환
    if (this.isConnecting || stompState === 2 || stompState === 3) { // 2 = CLOSING, 3 = CLOSED
      return false;
    }
    
    // CONNECTING 상태 (0)도 false 반환
    return false;
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
