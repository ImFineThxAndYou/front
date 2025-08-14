export interface ChatRequestSummary {
  roomUuid: string;
  opponentId: number;
  opponentName: string;
  roomStatus: string;
  createdAt: string;
}

export interface ChatRequestAction {
  roomUuid: string;
  receiverId: number;
}

