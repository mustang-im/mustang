import type { MessageGroup } from "./MessageGrouping";

export type MessageRow<T> =
  { kind: "header", group: MessageGroup<T>, isCollapsed: boolean } |
  { kind: "message", group: MessageGroup<T>, message: T, position: number };

export class MessageRows<T> {
  readonly rows: MessageRow<T>[] = [];
  readonly messages: T[] = [];
  readonly totalHeight: number;
  protected readonly tops: number[] = [];
  protected readonly rowOfMessage = new Map<T, number>();
  protected readonly headerHeight: number;
  protected readonly messageHeight: number;

  constructor(groups: MessageGroup<T>[], collapsedGroupIDs: Set<string>, showHeaders: boolean, headerHeight: number, messageHeight: number) {
    this.headerHeight = headerHeight;
    this.messageHeight = messageHeight;
    let y = 0;
    for (let group of groups) {
      let isCollapsed = showHeaders && collapsedGroupIDs.has(group.id);
      if (showHeaders) {
        this.tops.push(y);
        this.rows.push({ kind: "header", group, isCollapsed });
        y += headerHeight;
      }
      if (isCollapsed) {
        continue;
      }
      for (let message of group.messages) {
        this.rowOfMessage.set(message, this.rows.length);
        this.tops.push(y);
        this.rows.push({ kind: "message", group, message, position: this.messages.length });
        this.messages.push(message);
        y += messageHeight;
      }
    }
    this.totalHeight = y;
  }

  get length(): number {
    return this.rows.length;
  }

  topOf(index: number): number {
    return this.tops[index] ?? this.totalHeight;
  }

  heightOf(index: number): number {
    return this.rows[index]?.kind == "header" ? this.headerHeight : this.messageHeight;
  }

  indexAt(y: number): number {
    if (!this.rows.length) {
      return -1;
    }
    let low = 0;
    let high = this.rows.length - 1;
    while (low < high) {
      let middle = Math.ceil((low + high) / 2);
      if (this.tops[middle] <= y) {
        low = middle;
      } else {
        high = middle - 1;
      }
    }
    return low;
  }

  indexOfMessage(message: T): number {
    return this.rowOfMessage.get(message) ?? -1;
  }

  hasMessage(message: T): boolean {
    return this.rowOfMessage.has(message);
  }

  headerIndexOf(group: MessageGroup<T>): number {
    return this.rows.findIndex(row => row.kind == "header" && row.group == group);
  }
}
