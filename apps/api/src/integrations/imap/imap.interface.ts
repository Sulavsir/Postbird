export interface ImapConnectionConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}
export interface ReceivedMessage {
  uid: number;
  messageId?: string;
  from?: string;
  subject?: string;
  receivedAt?: Date;
  text?: string;
}
export interface ImapProvider {
  syncInbox(): Promise<ReceivedMessage[]>;
  close(): Promise<void>;
}
