import { apiUtils } from '../utils/api';
import { useNotificationStore } from '../stores/notification';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class SSEManager {
  private static instance: SSEManager;
  private connectionId: string | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private abortController: AbortController | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  private constructor() {}

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  async connect(memberName: string): Promise<void> {
    // 이미 연결 중이거나 연결된 경우 중복 연결 방지
    if (this.isConnecting || this.connectionId) {
      console.log('⚠️ SSE 이미 연결 중이거나 연결됨, 중복 연결 방지');
      return;
    }

    // 같은 사용자로 이미 연결된 경우 중복 연결 방지
    const currentUser = useNotificationStore.getState().currentUser;
    if (currentUser === memberName && this.connectionId) {
      console.log('⚠️ 같은 사용자로 이미 SSE 연결됨, 중복 연결 방지');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('❌ 액세스 토큰이 없습니다.');
      useNotificationStore.getState().setConnectionError('액세스 토큰이 없습니다.');
      return;
    }

    console.log('🔗 SSE 연결 시도 시작:', memberName);
    this.isConnecting = true;
    useNotificationStore.getState().setConnecting(true);

    // AbortController 생성
    this.abortController = new AbortController();
    const connectionId = `sse-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.connectionId = connectionId;

    try {
      // AbortController가 이미 중단된 경우 연결 시도하지 않음
      if (this.abortController.signal.aborted) {
        console.log('⚠️ AbortController가 이미 중단됨 - 연결 건너뜀');
        return;
      }

      const url = `${API_BASE_URL}/api/notify/sse`;
      
      // API 유틸리티를 사용하여 SSE 연결
      const response = await apiUtils.fetchSSE(url, { 
        signal: this.abortController.signal 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body reader not available');
      }

      // reader 저장
      this.reader = reader;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      // 전역 상태 업데이트
      useNotificationStore.getState().setSSEConnected(true, connectionId);
      console.log('🔗 SSE 연결 성공:', connectionId);

      // 스트림 읽기 시작
      this.readStream();

    } catch (error: any) {
      this.isConnecting = false;
      
      // AbortError는 정상적인 취소이므로 로그하지 않음
      if (error.name !== 'AbortError') {
        console.error('❌ SSE 연결 실패:', error);
        useNotificationStore.getState().setConnectionError(error.message || 'SSE 연결 실패');
        
        // 재연결 시도
        this.scheduleReconnect(memberName);
      }
    }
  }

  private readStream(): void {
    if (!this.reader) {
      console.log('❌ SSE reader가 없음');
      return;
    }

    // AbortController가 이미 중단된 경우 읽기 중단
    if (this.abortController?.signal.aborted) {
      console.log('⚠️ AbortController가 중단됨 - 읽기 중단');
      return;
    }

    this.reader.read().then(({ done, value }) => {
      if (done) {
        console.log('🔌 SSE 스트림 종료');
        this.handleDisconnection();
        return;
      }

      // 데이터 처리
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');
      
      let currentEvent = '';
      let currentData = '';
      let currentId = '';
      
      lines.forEach(line => {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          currentData = line.slice(5).trim();
        } else if (line.startsWith('id:')) {
          currentId = line.slice(3).trim();
        } else if (line === '') {
          // 빈 줄은 이벤트 구분자
          if (currentEvent && currentData) {
            this.processSSEEvent(currentEvent, currentData, currentId);
          }
          // 초기화
          currentEvent = '';
          currentData = '';
          currentId = '';
        }
      });
      
      // 마지막 이벤트 처리
      if (currentEvent && currentData) {
        this.processSSEEvent(currentEvent, currentData, currentId);
      }

      // 계속 읽기 (AbortController 상태 확인)
      if (!this.abortController?.signal.aborted && this.reader) {
        this.readStream();
      }
    }).catch((error: any) => {
      // AbortError는 정상적인 취소이므로 로그하지 않음
      if (error.name !== 'AbortError') {
        console.error('❌ SSE 스트림 읽기 오류:', error);
      }
      this.handleDisconnection();
    });
  }

  private processSSEEvent(eventType: string, eventData: string, eventId: string): void {
    console.log(`📨 SSE 이벤트 수신: ${eventType}`, eventData);
    
    try {
      if (eventType === 'ping') {
        console.log('🏓 Ping 수신');
        
        // 하트비트 응답 전송
        apiUtils.sendHeartbeat().then(() => {
          console.log('✅ 하트비트 응답 전송 성공');
        }).catch(error => {
          console.error('❌ 하트비트 응답 전송 오류:', error);
        });
      }
      // 다른 이벤트 타입들은 필요에 따라 처리
    } catch (error) {
      console.error('❌ SSE 이벤트 처리 오류:', error);
    }
  }

  private handleDisconnection(): void {
    console.log('🔌 SSE 연결 해제 처리');
    
    // 이미 정리 중인 경우 중복 처리 방지
    if (!this.connectionId && !this.reader && !this.abortController) {
      console.log('⚠️ 이미 정리됨 - 중복 처리 방지');
      return;
    }
    
    this.cleanup();
    useNotificationStore.getState().setSSEConnected(false);
  }

  private scheduleReconnect(memberName: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ 최대 재연결 시도 횟수 초과');
      useNotificationStore.getState().setConnectionError('최대 재연결 시도 횟수를 초과했습니다.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // 지수 백오프, 최대 30초
    
    console.log(`🔄 ${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect(memberName);
    }, delay);
  }

  disconnect(): void {
    console.log('🔌 SSE 연결 해제 요청');
    
    // 재연결 타이머 정리
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // AbortController 정리 (안전하게)
    if (this.abortController) {
      try {
        // 이미 중단된 경우 abort() 호출하지 않음
        if (!this.abortController.signal.aborted) {
          this.abortController.abort();
          console.log('🔌 SSE 요청 취소됨');
        }
      } catch (error: any) {
        // AbortError는 정상적인 취소이므로 무시
        if (error.name !== 'AbortError') {
          console.error('❌ SSE 요청 취소 오류:', error);
        }
      } finally {
        this.abortController = null;
      }
    }

    // reader 정리 (안전하게)
    if (this.reader) {
      try {
        // reader가 이미 닫혀있지 않은 경우에만 cancel 호출
        if (!this.reader.closed) {
          this.reader.cancel().catch((error: any) => {
            // AbortError는 정상적인 취소이므로 무시
            if (error.name !== 'AbortError') {
              console.error('❌ SSE reader 취소 오류:', error);
            }
          });
          console.log('🔌 SSE reader 취소 요청됨');
        }
      } catch (error: any) {
        // AbortError는 정상적인 취소이므로 무시
        if (error.name !== 'AbortError') {
          console.error('❌ SSE reader 정리 오류:', error);
        }
      } finally {
        this.reader = null;
      }
    }

    // 상태 정리
    this.cleanup();
    useNotificationStore.getState().resetSSEConnection();
    
    console.log('🔌 SSE 연결 해제 완료');
  }

  private cleanup(): void {
    this.connectionId = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return !!this.connectionId;
  }

  getConnectionId(): string | null {
    return this.connectionId;
  }
}

// 싱글톤 인스턴스 export
export const sseManager = SSEManager.getInstance();
