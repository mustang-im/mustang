import type { ChatMessage } from "./Message";
import type { ChatPerson } from "../Chat/Person";
import { ArrayColl, Collection, MapColl } from 'svelte-collections';

export class ChatAccount {
  persons = new ArrayColl<ChatPerson>();
  messagesByPerson = new MapColl<ChatPerson, Collection<ChatMessage>>;
}
