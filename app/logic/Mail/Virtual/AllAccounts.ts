import { MailAccount } from "../MailAccount";
import { Folder, SpecialFolder } from "../Folder";
import { AllFolders } from "./AllFolders";
import { Collection, mergeColls } from "svelte-collections";

/** Unified view of all other active mail accounts */
export class AllAccounts extends MailAccount {
  readonly protocol: string = "all";
  /** The list of accounts currently enabled.
   * Either same as appGlobal.emailAccounts,
   * or a subset of them based on the workspace selection. */
  accounts: Collection<MailAccount>;
  allRootFolders: Collection<Folder>;

  /** @param accounts typically `appGlobal.emailAccounts` */
  constructor(accounts: Collection<MailAccount>) {
    super();
    this.name = "All accounts";
    this.accounts = accounts;
    this.allRootFolders = mergeColls(this.accounts.map(account => account.rootFolders));

    let all = new AllFolders(this);
    all.name = "All messages";
    all.specialFolder = SpecialFolder.All;
    //all.followSpecialFolder(SpecialFolder.All);
    all.folders = mergeColls(this.accounts.map(account => account.getAllFolders()));
    this.rootFolders.add(all as any as Folder);

    let inbox = new AllFolders(this);
    inbox.name = "Inbox";
    inbox.specialFolder = SpecialFolder.Inbox;
    inbox.followSpecialFolder(SpecialFolder.Inbox);
    this.rootFolders.add(inbox as any as Folder);

    let sent = new AllFolders(this);
    sent.name = "Sent";
    inbox.specialFolder = SpecialFolder.Sent;
    sent.followSpecialFolder(SpecialFolder.Sent);
    this.rootFolders.add(sent as any as Folder);

    let drafts = new AllFolders(this);
    drafts.name = "Drafts";
    drafts.specialFolder = SpecialFolder.Drafts;
    drafts.followSpecialFolder(SpecialFolder.Drafts);
    this.rootFolders.add(drafts as any as Folder);
  }

  get isLoggedIn(): boolean {
    return this.accounts.contents.some(acc => acc.isLoggedIn);
  }

  async login(interactive: boolean): Promise<void> {
    for (let account of this.accounts) {
      await account.login(interactive);
    }
  }

  async listFolders(): Promise<void> {
    await Promise.all(this.accounts.contents.map(account =>
      account.listFolders()));
  }

  async logout(): Promise<void> {
    for (let account of this.accounts) {
      await account.logout();
    }
  }

  newFolder(): Folder {
    throw new Error("Select a specific account to create a folder");
  }
}
