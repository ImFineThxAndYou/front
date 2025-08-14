import { create } from 'zustand';

interface NotificationState {
  isSSEConnected: boolean;
  sseConnectionId: string | null;
  isConnecting: boolean;
  connectionError: string | null;
  setSSEConnected: (connected: boolean, connectionId?: string) => void;
  setConnecting: (connecting: boolean) => void;
  setConnectionError: (error: string | null) => void;
  resetSSEConnection: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isSSEConnected: false,
  sseConnectionId: null,
  isConnecting: false,
  connectionError: null,
  
  setSSEConnected: (connected: boolean, connectionId?: string) => {
    set({
      isSSEConnected: connected,
      sseConnectionId: connectionId || null,
      isConnecting: false,
      connectionError: null
    });
  },
  
  setConnecting: (connecting: boolean) => {
    set({ isConnecting: connecting });
  },
  
  setConnectionError: (error: string | null) => {
    set({ 
      connectionError: error,
      isConnecting: false,
      isSSEConnected: false 
    });
  },
  
  resetSSEConnection: () => {
    set({
      isSSEConnected: false,
      sseConnectionId: null,
      isConnecting: false,
      connectionError: null
    });
  }
}));
