import { ArrayColl } from "svelte-collections";

export class Node {
  name: string = "";
  /** any valid foo in `<img src="foo">` */
  icon: string | null = null;
  /** Used when `icon` is null */
  placeholder: string | null = null;
  isBold: boolean = false;
  isFocus: boolean = false;
  readonly children = new ArrayColl<Node>();
}
