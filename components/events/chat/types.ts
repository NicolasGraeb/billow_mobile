export interface ChatUser {
  id: number;
  username: string;
  email: string;
}

export interface ChatMessage {
  id: number;
  event_id: number;
  sender: ChatUser;
  content: string;
  created_at: string;
}

