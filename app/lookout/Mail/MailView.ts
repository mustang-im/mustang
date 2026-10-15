import type { Folder } from "../../logic/Mail/Folder";
import { ArrangeBy } from "./MessageList/MessageGrouping";
import { getLocalStorage } from "../../frontend/Util/LocalStorage";

export enum ReadingPanePosition {
  Right = "right",
  Bottom = "bottom",
  Off = "off",
}

export enum FolderPaneMode {
  Normal = "normal",
  Minimized = "minimized",
  Off = "off",
}

export class MailView {
  static readonly readingPane = getLocalStorage<ReadingPanePosition>("lookout.mail.readingPane", ReadingPanePosition.Right);
  static readonly folderPane = getLocalStorage<FolderPaneMode>("lookout.mail.folderPane", FolderPaneMode.Normal);
  static readonly previewLines = getLocalStorage<number>("lookout.mail.previewLines", 1);
  static readonly arrangeBy = getLocalStorage<ArrangeBy>("lookout.mail.arrangeBy", ArrangeBy.Date);
  static readonly reverseSort = getLocalStorage<boolean>("lookout.mail.reverseSort", false);
  static readonly showInGroups = getLocalStorage<boolean>("lookout.mail.showInGroups", true);
  static readonly collapsedSections = getLocalStorage<string[]>("lookout.mail.collapsedSections", []);
  static readonly expandedFolders = getLocalStorage<string[]>("lookout.mail.expandedFolders", []);
  static readonly contentRendering = getLocalStorage<string>("mail.contentRendering", "html");
  static readonly readAfter = getLocalStorage<number>("mail.read.after", 0);

  static resetView() {
    MailView.previewLines.value = 1;
    MailView.arrangeBy.value = ArrangeBy.Date;
    MailView.reverseSort.value = false;
    MailView.showInGroups.value = true;
    MailView.readingPane.value = ReadingPanePosition.Right;
    MailView.folderPane.value = FolderPaneMode.Normal;
  }

  static isSectionCollapsed(id: string): boolean {
    return (MailView.collapsedSections.value ?? []).includes(id);
  }

  static setSectionCollapsed(id: string, collapsed: boolean) {
    MailView.collapsedSections.value = MailView.withID(MailView.collapsedSections.value, id, collapsed);
  }

  static isFolderExpanded(folder: Folder): boolean {
    return (MailView.expandedFolders.value ?? []).includes(MailView.folderNodeID(folder));
  }

  static setFolderExpanded(folder: Folder, expanded: boolean) {
    MailView.expandedFolders.value = MailView.withID(MailView.expandedFolders.value, MailView.folderNodeID(folder), expanded);
  }

  static folderNodeID(folder: Folder): string {
    return folder.account?.id + "/" + folder.id;
  }

  protected static withID(ids: string[] | null, id: string, include: boolean): string[] {
    let result = (ids ?? []).filter(existing => existing != id);
    if (include) {
      result.push(id);
    }
    return result;
  }
}
