import { Account } from "../Abstract/Account";
import type { ChatPerson } from "./Person";
import type { Group } from "../Abstract/Group";
import { Chat } from "./Chat";
import { TLSSocketType } from "../Mail/MailAccount";
import { ArrayColl, MapColl } from 'svelte-collections';
import { notifyChangedProperty } from "../util/Observable";

export class ChatAccount extends Account {
  readonly protocol = "chat";
  @notifyChangedProperty
  hostname: string | null = null; /** only for some account types */
  @notifyChangedProperty
  port: number | null = null;
  @notifyChangedProperty
  tls = TLSSocketType.Unknown;
  @notifyChangedProperty
  password: string | null = null;

  readonly persons = new ArrayColl<ChatPerson>();
  readonly chats = new MapColl<ChatPerson | Group, Chat>;

  @notifyChangedProperty
  isOnline = false;

  newChat(): Chat {
    return new Chat(this);
  }
}
