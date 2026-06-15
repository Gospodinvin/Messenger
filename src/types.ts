/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: "online" | "offline" | "away";
}

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "video" | "docx" | "xlsx" | "pdf" | "txt";
  url?: string;
  size: string;
  localPath: string;
  contentSnapshot?: string; // Stored content snippet for offline AI context
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  attachments?: Attachment[];
  detectedTask?: {
    suggestedTaskTitle: string;
    assigneeName: string;
    deadline: string;
  };
}

export interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  avatar: string;
  participants: User[];
  messages: Message[];
  unreadCount: number;
}

export type CallStatus = "idle" | "ringing" | "connecting" | "active" | "ended";

export interface ActiveCall {
  id: string;
  partner: User;
  isVideo: boolean;
  isVideoEnabled: boolean;
  isMuted: boolean;
  status: CallStatus;
  duration: number; // in seconds
}

export interface Task {
  id: string;
  chatId: string;
  chatName: string;
  title: string;
  assignee: User;
  deadline: string;
  status: "pending" | "completed";
  priority: "low" | "medium" | "high";
}

export interface CallLog {
  id: string;
  partner: User;
  isVideo: boolean;
  type: "incoming" | "outgoing" | "missed";
  timestamp: string;
  duration: string;
}

export interface FileDocument {
  id: string;
  name: string;
  type: "docx" | "xlsx" | "pdf" | "txt";
  size: string;
  createdAt: string;
  content: string;
  originalBackupContent?: string;
}

export interface SecurityConfig {
  isEnabled: boolean;
  useBiometrics: boolean;
  passcode: string; // 4 digits
  isLocked: boolean;
  isSQLCipherActive: boolean;
}
