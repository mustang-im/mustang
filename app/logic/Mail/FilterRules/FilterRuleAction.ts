import type { EMail } from "../EMail";
import { FilterMoment } from "./FilterMoments";
import { SearchEMail } from "../Store/SearchEMail";
import type { Folder } from "../Folder";
import { getTagByName, type Tag } from "../Tag";
import { Observable } from "../../util/Observable";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { gt } from "../../../l10n/l10n";

/** Does automatic user-defined actions on emails,
 * on defined moments (e.g. new email arrived, email sent etc.),
 * for emails that match user-defined criteria. */
export class FilterRuleAction extends Observable {
  name: string = gt`New rule`;
  /** For which email and at which moment the filter should be run */
  when: FilterMoment = FilterMoment.IncomingBeforeSpam;
  /** For which subset of emails the filter should run */
  criteria = new SearchEMail();

  /** The following actions cannot be combined:
   * - Delete/spam actions with toFolder or markAsStarred
   */
  /** Move or copy (`copyToFolder`) the email to this folder. */
  toFolder: Folder | undefined = undefined;
  /** If `toFolder` and `copyToFolder`, then copy the email. instead of moving. */
  copy: boolean | undefined = undefined;
  addTag: Tag | undefined = undefined;

  markAsRead: boolean | undefined = undefined;
  markAsStarred: boolean | undefined = undefined;

  /** Marks the message as spam, and maybe moves it to the spam folder */
  markAsSpam: boolean | undefined = undefined;
  /** Move the message to the trash folder */
  deleteTrash: boolean | undefined = undefined;
  /** Make this message disappear immediately. Do not move to trash. Use with care. */
  deleteImmediately: boolean | undefined = undefined;

  /** Checks for a match, and runs the filter action, as needed. */
  async run(email: EMail): Promise<void> {
    if (!this.criteria.matches(email)) {
      return;
    }
    await this.doAction(email);
  }

  /** Executes the filter action.
   * Unconditionally, i.e. does not check for match. */
  async doAction(email: EMail): Promise<void> {
    if (this.markAsRead !== undefined) {
      await email.markRead(this.markAsRead);
    }
    if (this.markAsStarred !== undefined) {
      await email.markStarred(this.markAsStarred);
    }
    if (this.addTag !== undefined) {
      await email.addTag(this.addTag);
    }
    if (this.toFolder !== undefined) {
      if (this.copy) {
        await this.toFolder.copyMessageHere(email);
      } else {
        await this.toFolder.moveMessageHere(email);
      }
      return;
    }
    if (this.markAsSpam !== undefined) {
      await email.treatSpam(this.markAsSpam);
      return;
    }
    if (this.deleteTrash !== undefined) {
      await email.deleteMessage();
      return;
    }
    if (this.deleteImmediately !== undefined) {
      await email.deleteMessage(); // TODO immediately
      return;
    }
  }

  fromJSON(json: any) {
    this.when = sanitize.enum<FilterMoment>(json.when, Object.values(FilterMoment));
    this.criteria = new SearchEMail();
    this.criteria.fromJSON(json.criteria);
    function boolean(value: boolean | undefined): boolean | undefined {
      return typeof (value) == "boolean" ? value : undefined;
    }
    this.markAsRead = boolean(json.markAsRead);
    this.markAsStarred = boolean(json.markAsStarred);
    this.markAsSpam = boolean(json.markAsSpam);
    this.deleteTrash = boolean(json.deleteTrash);
    this.deleteImmediately = boolean(json.deleteImmediately);
    this.copy = boolean(json.copy);
    // let folderAccount = appGlobal.emailAccounts.find(acc => acc.id == json.toFolderAccountID);
    // this.toFolder = folderAccount?.findFolder(folder => folder.id == json.toFolder) ?? undefined;
    this.addTag = getTagByName(json.addTag);
  }

  toJSON() {
    return {
      when: this.when,
      criteria: this.criteria.toJSON(),
      markAsRead: this.markAsRead,
      markAsStarred: this.markAsStarred,
      markAsSpam: this.markAsSpam,
      deleteTrash: this.deleteTrash,
      deleteImmediately: this.deleteImmediately,
      copy: this.copy,
      toFolderAccountID: this.toFolder?.account?.id,
      toFolder: this.toFolder?.id,
      addTag: this.addTag?.name,
    };
  }

  clone(): FilterRuleAction {
    let clone = new (this as any).constructor();
    clone.fromJSON(this.toJSON());
    return clone;
  }
}
