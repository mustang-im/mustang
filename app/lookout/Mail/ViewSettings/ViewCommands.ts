import type { Folder } from "../../../logic/Mail/Folder";
import type { ArrangeBy } from "../3pane/MessageGrouping";
import { MailViewSettings, type ViewSettings } from "./ViewSettings";

export class ViewCommands {
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
}
