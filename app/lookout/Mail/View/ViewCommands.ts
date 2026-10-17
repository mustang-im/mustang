import type { Folder } from "../../../logic/Mail/Folder";
import { ArrangeBy } from "../MessageList/MessageGrouping";
import { ApplyScope, Column, MailViewSettings, ViewType, type ViewSettings } from "./ViewSettings";
import { ViewDialogs } from "./ViewDialogs";
import { gt } from "../../../l10n/l10n";

export class ViewCommands {
  static changeView(folder: Folder | null, type: ViewType) {
    MailViewSettings.change(folder, { type });
  }

  static arrangeBy(folder: Folder | null, field: ArrangeBy) {
    let settings = MailViewSettings.of(folder);
    let changes: Partial<ViewSettings> = { arrangeBy: field };
    if (settings.arrangeBy != field) {
      changes.reverseSort = false;
    }
    MailViewSettings.change(folder, changes);
  }

  static sortByColumn(folder: Folder | null, field: ArrangeBy) {
    let settings = MailViewSettings.of(folder);
    if (settings.arrangeBy == field) {
      MailViewSettings.change(folder, { reverseSort: !settings.reverseSort });
    } else {
      MailViewSettings.change(folder, { arrangeBy: field, reverseSort: false });
    }
  }

  static setReverseSort(folder: Folder | null, reverse: boolean) {
    MailViewSettings.change(folder, { reverseSort: reverse });
  }

  static setShowInGroups(folder: Folder | null, show: boolean) {
    MailViewSettings.change(folder, { showInGroups: show });
  }

  static async setShowAsConversations(folder: Folder | null, show: boolean) {
    let scope = await ViewDialogs.askScope(show
      ? gt`Do you want to show messages arranged by conversations in all folders or just this folder?`
      : gt`Do you want to stop showing messages arranged by conversations in all folders or just this folder?`);
    if (scope) {
      MailViewSettings.change(folder, { showAsConversations: show }, scope);
    }
  }

  static async setPreviewLines(folder: Folder | null, lines: number) {
    let scope = await ViewDialogs.askScope(gt`Do you want to change the message preview in all folders or just this folder?`);
    if (scope) {
      MailViewSettings.change(folder, { previewLines: lines }, scope);
    }
  }

  static setConversationOption(folder: Folder | null, changes: Partial<ViewSettings>) {
    MailViewSettings.change(folder, changes, ApplyScope.AllFolders);
  }

  static addColumns(folder: Folder | null) {
    if (MailViewSettings.of(folder).type == ViewType.Compact) {
      MailViewSettings.change(folder, { type: ViewType.Single });
    }
    ViewDialogs.open({ kind: "show-columns", folder });
  }

  static removeColumn(folder: Folder | null, column: Column) {
    let columns = MailViewSettings.of(folder).columns.filter(existing => existing != column);
    MailViewSettings.change(folder, { columns });
  }

  static resizeColumn(folder: Folder | null, column: Column, width: number) {
    let columnWidths = { ...MailViewSettings.of(folder).columnWidths, [column]: Math.round(width) };
    MailViewSettings.change(folder, { columnWidths });
  }

  static groupByField(folder: Folder | null, field: ArrangeBy) {
    MailViewSettings.change(folder, { groupBy: field, groupReverse: false, showInGroups: true });
  }

  static openViewSettings(folder: Folder | null) {
    ViewDialogs.open({ kind: "view-settings", folder });
  }
}
