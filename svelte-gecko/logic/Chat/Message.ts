import { Message } from "../Abstract/Message";
import type { Chat } from "./Chat";

export class ChatMessage extends Message {
  to: Chat;
}
