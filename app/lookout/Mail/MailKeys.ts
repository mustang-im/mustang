export enum MailKeyAction {
  NewMail = "new-mail",
  Reply = "reply",
  ReplyAll = "reply-all",
  Forward = "forward",
  ForwardAsAttachment = "forward-as-attachment",
  Delete = "delete",
  DeletePermanently = "delete-permanently",
  Archive = "archive",
  MarkRead = "mark-read",
  MarkUnread = "mark-unread",
  ToggleFlag = "toggle-flag",
  MoveToFolder = "move-to-folder",
  CopyToFolder = "copy-to-folder",
  NotJunk = "not-junk",
  SendReceiveAll = "send-receive-all",
  UpdateFolder = "update-folder",
  Search = "search",
  ScopeCurrentFolder = "scope-current-folder",
  ScopeAllAccounts = "scope-all-accounts",
  NewFolder = "new-folder",
  NewSearchFolder = "new-search-folder",
  GoToFolder = "go-to-folder",
  GoToInbox = "go-to-inbox",
  NextMessage = "next-message",
  PreviousMessage = "previous-message",
  Print = "print",
}

export interface KeyPress {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

export class MailKeys {
  static actionFor(event: KeyPress): MailKeyAction | null {
    let key = event.key?.length == 1 ? event.key.toLowerCase() : event.key;
    let ctrl = !!(event.ctrlKey || event.metaKey);
    let shift = !!event.shiftKey;
    let alt = !!event.altKey;
    if (ctrl && alt && !shift) {
      switch (key) {
        case "f": return MailKeyAction.ForwardAsAttachment;
        case "j": return MailKeyAction.NotJunk;
        case "k": return MailKeyAction.ScopeCurrentFolder;
        case "a": return MailKeyAction.ScopeAllAccounts;
      }
      return null;
    }
    if (alt) {
      return null;
    }
    if (ctrl && shift) {
      switch (key) {
        case "m": return MailKeyAction.NewMail;
        case "r": return MailKeyAction.ReplyAll;
        case "v": return MailKeyAction.MoveToFolder;
        case "y": return MailKeyAction.CopyToFolder;
        case "e": return MailKeyAction.NewFolder;
        case "p": return MailKeyAction.NewSearchFolder;
        case "i": return MailKeyAction.GoToInbox;
      }
      return null;
    }
    if (ctrl) {
      switch (key) {
        case "n": return MailKeyAction.NewMail;
        case "r": return MailKeyAction.Reply;
        case "f": return MailKeyAction.Forward;
        case "d": return MailKeyAction.Delete;
        case "q": return MailKeyAction.MarkRead;
        case "u": return MailKeyAction.MarkUnread;
        case "m": return MailKeyAction.SendReceiveAll;
        case "e": return MailKeyAction.Search;
        case "y": return MailKeyAction.GoToFolder;
        case ".": return MailKeyAction.NextMessage;
        case ",": return MailKeyAction.PreviousMessage;
        case "p": return MailKeyAction.Print;
      }
      return null;
    }
    if (shift) {
      switch (key) {
        case "Delete": return MailKeyAction.DeletePermanently;
        case "F9": return MailKeyAction.UpdateFolder;
      }
      return null;
    }
    switch (key) {
      case "Delete": return MailKeyAction.Delete;
      case "Backspace": return MailKeyAction.Archive;
      case "Insert": return MailKeyAction.ToggleFlag;
      case "F9": return MailKeyAction.SendReceiveAll;
      case "F3": return MailKeyAction.Search;
    }
    return null;
  }

  static worksInTextFields(action: MailKeyAction): boolean {
    return [
      MailKeyAction.NewMail,
      MailKeyAction.SendReceiveAll,
      MailKeyAction.UpdateFolder,
      MailKeyAction.Search,
      MailKeyAction.ScopeCurrentFolder,
      MailKeyAction.ScopeAllAccounts,
    ].includes(action);
  }

  static isTextField(target: EventTarget | null): boolean {
    let element = target as HTMLElement;
    return !!element?.closest?.("input, textarea, select, [contenteditable]:not([contenteditable=false])");
  }
}
