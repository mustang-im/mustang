import type { Folder } from "../../../logic/Mail/Folder";
import { ArrangeBy } from "../MessageList/MessageGrouping";
import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
import { derived, type Readable } from "svelte/store";
import { gt } from "../../../l10n/l10n";

export enum ViewType {
  Compact = "compact",
  Single = "single",
  Preview = "preview",
}

export enum Column {
  Importance = "importance",
  Icon = "icon",
  Attachment = "attachment",
  From = "from",
  To = "to",
  Subject = "subject",
  Received = "received",
  Sent = "sent",
  Size = "size",
  Categories = "categories",
  Flag = "flag",
  Folder = "folder",
}

export enum ApplyScope {
  ThisFolder = "folder",
  AllFolders = "all",
}

export interface ViewSettings {
  type: ViewType;
  columns: Column[];
  columnWidths: Partial<Record<Column, number>>;
  arrangeBy: ArrangeBy;
  reverseSort: boolean;
  showInGroups: boolean;
  groupBy: ArrangeBy | null;
  groupReverse: boolean;
  previewLines: number;
  tighterSpacing: boolean;
  showAsConversations: boolean;
  showSendersAboveSubject: boolean;
  alwaysExpandSelected: boolean;
  classicIndented: boolean;
  useCompactLayout: boolean;
  compactLayoutChars: number;
}

export class ColumnInfo {
  readonly id: Column;
  readonly label: string;
  readonly width: number;
  readonly isIcon: boolean;
  readonly sortField: ArrangeBy | null;

  constructor(id: Column, label: string, width: number, isIcon: boolean, sortField: ArrangeBy | null) {
    this.id = id;
    this.label = label;
    this.width = width;
    this.isIcon = isIcon;
    this.sortField = sortField;
  }

  static readonly all: ColumnInfo[] = [
    new ColumnInfo(Column.Importance, gt`Importance`, 24, true, ArrangeBy.Importance),
    new ColumnInfo(Column.Icon, gt`Icon`, 24, true, null),
    new ColumnInfo(Column.Attachment, gt`Attachment`, 24, true, null),
    new ColumnInfo(Column.From, gt`From`, 160, false, ArrangeBy.From),
    new ColumnInfo(Column.To, gt`To`, 160, false, null),
    new ColumnInfo(Column.Subject, gt`Subject`, 0, false, ArrangeBy.Subject),
    new ColumnInfo(Column.Received, gt`Received`, 132, false, ArrangeBy.Date),
    new ColumnInfo(Column.Sent, gt`Sent`, 132, false, ArrangeBy.Date),
    new ColumnInfo(Column.Size, gt`Size`, 72, false, ArrangeBy.Size),
    new ColumnInfo(Column.Categories, gt`Categories`, 104, false, null),
    new ColumnInfo(Column.Flag, gt`Flag Status`, 28, true, ArrangeBy.Flag),
    new ColumnInfo(Column.Folder, gt`In Folder`, 120, false, null),
  ];

  static of(id: Column): ColumnInfo | null {
    return ColumnInfo.all.find(column => column.id == id) ?? null;
  }

  static labelOf(id: Column): string {
    return ColumnInfo.of(id)?.label ?? id;
  }

  get isFlexible(): boolean {
    return this.width == 0;
  }
}

export class ArrangeFields {
  static all(): { id: ArrangeBy, label: string, button: string }[] {
    return [
      { id: ArrangeBy.Date, label: gt`Date`, button: gt`By Date` },
      { id: ArrangeBy.From, label: gt`From`, button: gt`By From` },
      { id: ArrangeBy.Subject, label: gt`Subject`, button: gt`By Subject` },
      { id: ArrangeBy.Size, label: gt`Size`, button: gt`By Size` },
      { id: ArrangeBy.Importance, label: gt`Importance`, button: gt`By Importance` },
      { id: ArrangeBy.Flag, label: gt`Flag Status`, button: gt`By Flag Status` },
    ];
  }

  static labelOf(field: ArrangeBy | null): string {
    return ArrangeFields.all().find(candidate => candidate.id == field)?.label ?? gt`None`;
  }
}

export class MailViewSettings {
  static readonly allFolders = getLocalStorage<Partial<ViewSettings>>("lookout.mail.view", {});
  static readonly folders = getLocalStorage<Record<string, Partial<ViewSettings>>>("lookout.mail.folderViews", {});

  static defaults(): ViewSettings {
    return {
      type: ViewType.Compact,
      columns: MailViewSettings.defaultColumns(),
      columnWidths: {},
      arrangeBy: ArrangeBy.Date,
      reverseSort: false,
      showInGroups: true,
      groupBy: null,
      groupReverse: false,
      previewLines: 1,
      tighterSpacing: false,
      showAsConversations: false,
      showSendersAboveSubject: true,
      alwaysExpandSelected: false,
      classicIndented: false,
      useCompactLayout: true,
      compactLayoutChars: 100,
    };
  }

  static shownType(view: ViewSettings, listWidth: number, charWidth: number): ViewType {
    if (view.type != ViewType.Compact && view.useCompactLayout &&
        listWidth > 0 && listWidth < view.compactLayoutChars * charWidth) {
      return ViewType.Compact;
    }
    return view.type;
  }

  static defaultColumns(): Column[] {
    return [
      Column.Importance,
      Column.Icon,
      Column.Attachment,
      Column.From,
      Column.Subject,
      Column.Received,
      Column.Size,
      Column.Categories,
      Column.Flag,
    ];
  }

  static keyOf(folder: Folder | null): string {
    return folder ? folder.account?.id + "/" + folder.id : "none";
  }

  static of(folder: Folder | null): ViewSettings {
    let forFolder = MailViewSettings.folders.value?.[MailViewSettings.keyOf(folder)];
    return { ...MailViewSettings.defaults(), ...MailViewSettings.allFolders.value, ...forFolder };
  }

  static store(folder: Folder | null): Readable<ViewSettings> {
    return derived([MailViewSettings.allFolders, MailViewSettings.folders], () => MailViewSettings.of(folder));
  }

  static change(folder: Folder | null, changes: Partial<ViewSettings>, scope = ApplyScope.ThisFolder) {
    if (scope == ApplyScope.AllFolders) {
      MailViewSettings.changeAllFolders(changes);
      return;
    }
    let all = { ...MailViewSettings.folders.value };
    let key = MailViewSettings.keyOf(folder);
    all[key] = { ...all[key], ...changes };
    MailViewSettings.folders.value = all;
  }

  protected static changeAllFolders(changes: Partial<ViewSettings>) {
    MailViewSettings.allFolders.value = { ...MailViewSettings.allFolders.value, ...changes };
    let all: Record<string, Partial<ViewSettings>> = {};
    for (let [key, settings] of Object.entries(MailViewSettings.folders.value ?? {})) {
      let remaining = { ...settings };
      for (let name of Object.keys(changes)) {
        delete remaining[name];
      }
      if (Object.keys(remaining).length) {
        all[key] = remaining;
      }
    }
    MailViewSettings.folders.value = all;
  }

  static reset(folder: Folder | null) {
    MailViewSettings.allFolders.value = {};
    let all = { ...MailViewSettings.folders.value };
    delete all[MailViewSettings.keyOf(folder)];
    MailViewSettings.folders.value = all;
  }

  static replace(folder: Folder | null, settings: ViewSettings) {
    let all = { ...MailViewSettings.folders.value };
    all[MailViewSettings.keyOf(folder)] = MailViewSettings.differences(settings, { ...MailViewSettings.defaults(), ...MailViewSettings.allFolders.value });
    MailViewSettings.folders.value = all;
  }

  static applyToFolders(from: Folder | null, targets: Folder[]) {
    let settings = MailViewSettings.of(from);
    let all = { ...MailViewSettings.folders.value };
    let base = { ...MailViewSettings.defaults(), ...MailViewSettings.allFolders.value };
    for (let target of targets) {
      all[MailViewSettings.keyOf(target)] = MailViewSettings.differences(settings, base);
    }
    MailViewSettings.folders.value = all;
  }

  protected static differences(settings: ViewSettings, base: ViewSettings): Partial<ViewSettings> {
    let result: Partial<ViewSettings> = {};
    for (let [name, value] of Object.entries(settings)) {
      if (JSON.stringify(value) != JSON.stringify(base[name])) {
        result[name] = value;
      }
    }
    return result;
  }

  static typeLabel(type: ViewType): string {
    switch (type) {
      case ViewType.Single:
        return gt`Single`;
      case ViewType.Preview:
        return gt`Preview`;
      default:
        return gt`Compact`;
    }
  }

  static widthOf(settings: ViewSettings, column: Column): number {
    return settings.columnWidths?.[column] ?? ColumnInfo.of(column)?.width ?? 100;
  }
}
