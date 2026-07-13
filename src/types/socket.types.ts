export type JoinRoomRequest = {
  conversation_id: string;
};

export type JoinRoomResponse = {
  socket_event: string;
  conversation_id: string;
  room: string;
  authorized: boolean;
  note: string;
};

export type LeaveRoomRequest = {
  conversation_id: string;
};

export type LeaveRoomResponse = {
  socket_event: string;
  conversation_id: string;
  room: string;
  note: string;
};

export type SendMessageSocketRequest = {
  content: string;
  conversation_id: string;
  message_type: string;
  attachment_id?: string;
};

export type SendMessageSocketResponse = {
  socket_event: string;
  data: Record<string, unknown>;
  server_events_emitted: string[];
};

export type SocketTypingRequest = {
  conversation_id: string;
};

export type MarkReadSocketRequest = {
  message_id: string;
};

export type SocketActionResponse = {
  socket_event: string;
  data: Record<string, unknown>;
  server_events_emitted: string[];
};
