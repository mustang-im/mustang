import type { ChatMessage } from "./Message";
import type { Person } from "../Person/Person";
import { ArrayColl, Collection, MapColl } from 'svelte-collections';

export class ChatAccount {
  persons = new ArrayColl<Person>();
  messagesByPerson = new MapColl<Person, Collection<ChatMessage>>;
}
