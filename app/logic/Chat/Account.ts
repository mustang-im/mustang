import { Account } from "../Abstract/Account";
import type { ChatPerson } from "../Chat/Person";
import type { Group } from "../Abstract/Group";
import type { Chat } from "../Chat/Chat";
import { ArrayColl, MapColl } from 'svelte-collections';
import { notifyChangedProperty } from "../util/Observable";

export class ChatAccount extends Account {
  readonly persons = new ArrayColl<ChatPerson>();
  readonly chats = new MapColl<ChatPerson | Group, Chat>;

  @notifyChangedProperty
  isOnline = false;
}
