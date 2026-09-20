import { ImapFlow } from "imapflow";
import type {
  ImapConnectionConfig,
  ImapProvider,
  ReceivedMessage,
} from "./imap.interface.js";

const MAX_MESSAGES = 40;

export class ImapService implements ImapProvider {
  private readonly client: ImapFlow;
  constructor(config: ImapConnectionConfig) {
    this.client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.username, pass: config.password },
      logger: false,
    });
  }
  async syncInbox(): Promise<ReceivedMessage[]> {
    await this.client.connect();
    const status = await this.client.status("INBOX", { messages: true });
    const exists = status.messages ?? 0;
    if (!exists) return [];
    const start = Math.max(1, exists - MAX_MESSAGES + 1);
    const messages: ReceivedMessage[] = [];
    const lock = await this.client.getMailboxLock("INBOX");
    try {
      for await (const message of this.client.fetch(`${start}:*`, {
        uid: true,
        envelope: true,
      })) {
        messages.push({
          uid: message.uid,
          messageId: message.envelope?.messageId,
          from: message.envelope?.from?.[0]?.address,
          subject: message.envelope?.subject,
          receivedAt: message.envelope?.date,
        });
      }
    } finally {
      lock.release();
    }
    return messages;
  }
  async close(): Promise<void> {
    await this.client.logout();
  }
}
