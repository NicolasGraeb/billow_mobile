export interface ChatUser {
  id: number;
  username: string;
  email: string;
  avatar_url?: string | null;
}

export interface ChatMessage {
  id: number;
  event_id: number;
  sender: ChatUser;
  content: string;
  created_at: string;
}
