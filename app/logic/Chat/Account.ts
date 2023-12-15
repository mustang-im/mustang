import { Account } from "../Abstract/Account";
import type { ChatPerson } from "../Chat/Person";
import type { Group } from "../Abstract/Group";
import type { Chat } from "../Chat/Chat";
import { ArrayColl, MapColl } from 'svelte-collections';

export class ChatAccount extends Account {
  persons = new ArrayColl<ChatPerson>();
  chats = new MapColl<ChatPerson | Group, Chat>;
}
