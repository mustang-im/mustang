import { JID } from "./JID";

/** A node in the WhatsApp binary XMPP tree, e.g.
 * `<message to="..." id="..."><body>hi</body></message>`. */
export class WANode {
  tag: string;
  attrs: Record<string, string>;
  /** null (no content), child nodes, raw bytes, or a string. */
  content: WANode[] | Uint8Array | string | null;

  constructor(tag: string, attrs: Record<string, string> = {}, content: WANode[] | Uint8Array | string | null = null) {
    this.tag = tag;
    this.attrs = attrs;
    this.content = content;
  }

  /** First direct child with the given tag, if any. */
  child(tag: string): WANode | undefined {
    if (Array.isArray(this.content)) {
      return this.content.find(node => node.tag == tag);
    }
    return undefined;
  }

  /** All direct children, or those with the given tag. */
  children(tag?: string): WANode[] {
    if (!Array.isArray(this.content)) {
      return [];
    }
    return tag ? this.content.filter(node => node.tag == tag) : this.content;
  }

  get contentBytes(): Uint8Array | null {
    return this.content instanceof Uint8Array ? this.content : null;
  }

  attr(name: string): string | undefined {
    return this.attrs[name];
  }

  jidAttr(name: string): JID | undefined {
    let value = this.attrs[name];
    return value ? JID.parse(value) : undefined;
  }
}
