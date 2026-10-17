export interface SelectableMessage {
  isRead: boolean;
  isStarred: boolean;
  isSpam: boolean;
  tags: { contains(tag: any): boolean };
}

export interface FolderMessage {
  folder: { messages: { contains(message: any): boolean } } | null;
}

export enum TagState {
  None = "none",
  Some = "some",
  All = "all",
}

export class SelectionState {
  static shouldMarkRead(messages: SelectableMessage[]): boolean {
    return !messages.every(message => message.isRead);
  }

  static shouldFlag(messages: SelectableMessage[]): boolean {
    return !messages.every(message => message.isStarred);
  }

  static allFlagged(messages: SelectableMessage[]): boolean {
    return messages.length > 0 && messages.every(message => message.isStarred);
  }

  static allRead(messages: SelectableMessage[]): boolean {
    return messages.length > 0 && messages.every(message => message.isRead);
  }

  static allSpam(messages: SelectableMessage[]): boolean {
    return messages.length > 0 && messages.every(message => message.isSpam);
  }

  static isRemovedFromFolder(message: FolderMessage): boolean {
    return !message.folder?.messages.contains(message);
  }

  static tagState(messages: SelectableMessage[], tag: any): TagState {
    let count = messages.filter(message => message.tags?.contains(tag)).length;
    if (count == 0) {
      return TagState.None;
    }
    return count == messages.length ? TagState.All : TagState.Some;
  }
}
