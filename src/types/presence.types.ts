export type PresenceStatus = 'online' | 'offline' | (string & {});

export type PresenceUser = {
  user_id: string;
  status: PresenceStatus;
  last_seen_at: string | null;
};

export type OnlineUsersResponse = {
  users: PresenceUser[];
  total: number;
};

export type UpdatePresenceStatusRequest = {
  status: PresenceStatus;
};

export type PresenceStatusResponse = PresenceUser;
