import type { MailMessage } from "./Message";
import type { ArrayColl } from 'svelte-collections';

export class Folder {
  name: string;
  messages: ArrayColl<MailMessage>;
}
