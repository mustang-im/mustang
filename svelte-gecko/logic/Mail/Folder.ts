import type { EMail } from "./Message";
import { ArrayColl } from 'svelte-collections';

export class Folder {
  name: string;
  messages = new ArrayColl<EMail>();
}
