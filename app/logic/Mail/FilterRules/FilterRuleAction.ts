import type { EMail } from "../EMail";
import { ProcessingStartOn } from "../EMailProccessor";
import { addFilterProcessors } from "../FilterRules/FilterProcessor";
import { SearchEMail } from "../Store/SearchEMail";
import type { MailAccount } from "../MailAccount";
import type { Folder } from "../Folder";
import { getTagByName, type Tag } from "../../Abstract/Tag";
import { notifyChangedProperty, Observable } from "../../util/Observable";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { SetColl } from "svelte-collections";

/** Does automatic user-defined actions on emails,
 * on defined moments (e.g. new email arrived, email sent etc.),
 * for emails that match user-defined criteria. */
export class FilterRuleAction extends Observable {
  @notifyChangedProperty
  name: string = "";
  /** For which email and at which moment the filter should be run */
  @notifyChangedProperty
  when: ProcessingStartOn = ProcessingStartOn.Incoming;
  /** For which subset of emails the filter should run */
  readonly criteria = new SearchEMail();

  /** The following actions cannot be combined:
   * - Delete/spam actions with toFolder or markAsStarred
   */
  /** Move or copy (`copyToFolder`) the email to this folder. */
  @notifyChangedProperty
  toFolder: Folder | null = null;
  /** If `toFolder` and `copyToFolder`, then copy the email. instead of moving. */
  @notifyChangedProperty
  copy: boolean | null = null;
  readonly account: MailAccount;
  readonly addTags = new SetColl<Tag>();

  @notifyChangedProperty
  markAsRead: boolean | null = null;
  @notifyChangedProperty
  markAsStarred: boolean | null = null;

  /** Marks the message as spam, and maybe moves it to the spam folder */
  @notifyChangedProperty
  markAsSpam: boolean | null = null;
  /** Move the message to the trash folder */
  @notifyChangedProperty
  deleteTrash: boolean | null = null;
  /** Make this message disappear immediately. Do not move to trash. Use with care. */
  @notifyChangedProperty
  deleteImmediately: boolean | null = null;

  constructor(account: MailAccount, criteria?: SearchEMail) {
    super();
    this.account = account;
    if (criteria) {
      this.criteria = criteria;
    }
  }

  /** Checks for a match, and runs the filter action, as needed. */
  async run(email: EMail): Promise<void> {
    if (!this.criteria.matches(email)) {
      return;
    }
    console.log("Running filter rule", this.name, "for email", email.subject);
    await this.doAction(email);
  }

  /** Executes the filter action.
   * Unconditionally, i.e. does not check for match. */
  async doAction(email: EMail): Promise<void> {
    if (booleanHasValue(this.markAsRead)) {
      await email.markRead(this.markAsRead);
    }
    if (booleanHasValue(this.markAsStarred)) {
      await email.markStarred(this.markAsStarred);
    }
    if (this.addTags.hasItems) {
      for (let tag of this.addTags) {
        console.log("add tag", tag.name);
        await email.addTag(tag);
      }
    }
    if (booleanHasValue(this.markAsSpam)) {
      await email.treatSpam(this.markAsSpam);
      if (this.markAsSpam) {
        return;
      }
    }
    if (booleanHasValue(this.deleteTrash) || booleanHasValue(this.deleteImmediately)) {
      await email.deleteMessage();
      return;
    }
    if (this.toFolder) {
      console.log(this.copy ? "copy" : "move", "to folder", this.toFolder.name);
      if (this.copy) {
        await this.toFolder.copyMessageHere(email);
      } else {
        await this.toFolder.moveMessageHere(email);
      }
      return;
    }
  }

  fromJSON(json: any) {
    this.name = sanitize.nonemptystring(json.name, "-");
    this.when = sanitize.enum<ProcessingStartOn>(json.when, Object.values(ProcessingStartOn));
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
    this.toFolder = this.account.findFolder(folder => folder.id == json.toFolder) ?? undefined;
    this.addTags.replaceAll(sanitize.array(json.addTags, [])?.map(name => getTagByName(name)));
  }

  toJSON() {
    return {
      name: this.name,
      when: this.when,
      criteria: this.criteria.toJSON(),
      markAsRead: this.markAsRead,
      markAsStarred: this.markAsStarred,
      markAsSpam: this.markAsSpam,
      deleteTrash: this.deleteTrash,
      deleteImmediately: this.deleteImmediately,
      copy: this.copy,
      // toFolderAccountID: this.toFolder?.account?.id,
      toFolder: this.toFolder?.id,
      tags: this.addTags.contents.map(tag => tag.name),
    };
  }

  clone(): FilterRuleAction {
    let clone = new (this as any).constructor();
    clone.fromJSON(this.toJSON());
    return clone;
  }
}

function booleanHasValue(value: boolean | null | undefined): boolean {
  return value === true || value === false;
}

addFilterProcessors();
