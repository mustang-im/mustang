import { Person } from "../Abstract/Person";
import type { ChatMessage } from "./Message";

export class ChatPerson extends Person {
  lastMessage: ChatMessage;
  draftMessage: string;
}
