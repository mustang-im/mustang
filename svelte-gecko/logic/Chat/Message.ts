import { Message } from "../Abstract/Message";
import type { Chat } from "./Chat";

export class ChatMessage extends Message {
  to: Chat;
}

/**
 * A human-language message from a human to other humans.
 */
export class UserChatMessage extends ChatMessage {
}
