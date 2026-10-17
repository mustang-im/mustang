import type { Folder } from "../../logic/Mail/Folder";
import { MailViewSettings } from "./ViewSettings/ViewSettings";
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

export enum ToDoBarPart {
  Calendar = "calendar",
  People = "people",
}

export class MailView {
  static readonly readingPane = getLocalStorage<ReadingPanePosition>("lookout.mail.readingPane", ReadingPanePosition.Right);
  static readonly folderPane = getLocalStorage<FolderPaneMode>("lookout.mail.folderPane", FolderPaneMode.Normal);
  static readonly showFavorites = getLocalStorage<boolean>("lookout.mail.showFavorites", true);
  static readonly separateAccountList = getLocalStorage<boolean>("lookout.mail.separateAccountList", false);
  static readonly ribbonCollapsed = getLocalStorage<boolean>("lookout.ribbon.collapsed", false);
  static readonly toDoBar = getLocalStorage<ToDoBarPart[]>("lookout.mail.toDoBar", []);

  static setToDoBarPart(part: ToDoBarPart, show: boolean) {
    let parts = (MailView.toDoBar.value ?? []).filter(existing => existing != part);
    if (show) {
      parts.push(part);
      parts.sort((a, b) => Object.values(ToDoBarPart).indexOf(a) - Object.values(ToDoBarPart).indexOf(b));
    }
    MailView.toDoBar.value = parts;
  }
  static readonly collapsedSections = getLocalStorage<string[]>("lookout.mail.collapsedSections", []);
  static readonly expandedFolders = getLocalStorage<string[]>("lookout.mail.expandedFolders", []);
  static readonly contentRendering = getLocalStorage<string>("mail.contentRendering", "html");
  static readonly readAfter = getLocalStorage<number>("mail.read.after", 0);

  static isReadingView(folderPane: FolderPaneMode, isRibbonCollapsed: boolean): boolean {
    return folderPane == FolderPaneMode.Minimized && isRibbonCollapsed;
  }

  static setReadingView(reading: boolean) {
    MailView.folderPane.value = reading ? FolderPaneMode.Minimized : FolderPaneMode.Normal;
    MailView.ribbonCollapsed.value = reading;
  }

  static resetView(folder: Folder | null) {
    MailViewSettings.reset(folder);
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

  static isNodeExpanded(nodeID: string, expandedIDs = MailView.expandedFolders.value): boolean {
    return (expandedIDs ?? []).includes(nodeID);
  }

  static setNodeExpanded(nodeID: string, expanded: boolean) {
    MailView.expandedFolders.value = MailView.withID(MailView.expandedFolders.value, nodeID, expanded);
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
