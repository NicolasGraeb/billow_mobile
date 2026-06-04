export type UserSummary = {
  id: number;
  username: string;
  email: string;
  avatar_url?: string | null;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
};

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  friends_count: number | null;
  avatar_url?: string | null;
};

export type EventSummary = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  finished_at: string | null;
  status: string;
  created_by: number;
  image_url?: string | null;
};

export type EventDetail = EventSummary & {
  participants: UserSummary[];
  creator: UserSummary;
};

export type ExpenseParticipant = {
  id: number;
  user_id: number;
  amount: number;
  user: UserSummary;
};

export type Expense = {
  id: number;
  event_id: number;
  payer_id: number;
  amount: number;
  description: string | null;
  created_at: string;
  payer: UserSummary;
  participants: ExpenseParticipant[];
};

export type CreateExpensePayload = {
  event_id: number;
  payer_id: number;
  amount: number;
  description: string | null;
  participants: Array<{ user_id: number; amount: number }>;
};

export type UpdateExpensePayload = {
  amount: number;
  description: string | null;
  payer_id: number;
  participants: Array<{ user_id: number; amount: number }>;
};

export type BalanceEntry = {
  from_user_id: number;
  to_user_id: number;
  amount: number;
  from_user: UserSummary;
  to_user: UserSummary;
};

export type EventBalance = {
  event_id: number;
  balances: BalanceEntry[];
  summary: Record<string, number>;
};

export type FriendUser = UserSummary;

export type FriendRelation = {
  id: number;
  user_id: number;
  friend_id: number;
  status: string;
  created_at?: string;
  user: FriendUser;
  friend: FriendUser;
};

export type FriendRequest = {
  id: number;
  from_user: FriendUser | null;
  to_user: FriendUser | null;
  status: string;
  created_at: string;
};

export type FriendshipStatus = {
  status: "none" | "pending" | "accepted" | "rejected";
  friendship_id?: number;
  is_sender?: boolean;
};

export type CreateEventPayload = {
  name: string;
  description?: string | null;
  participant_ids: number[];
};

export type ChatMessage = {
  id: number;
  event_id: number;
  sender: UserSummary & { avatar_url?: string | null };
  content: string;
  created_at: string;
};
