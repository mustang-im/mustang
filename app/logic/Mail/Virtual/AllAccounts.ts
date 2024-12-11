// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { MailAccount } from "../MailAccount";
import { Folder, SpecialFolder } from "../Folder";
import { AllFolders } from "./AllFolders";
import { ArrayColl, Collection, mergeColl, mergeColls } from "svelte-collections";
import { gt } from "../../../l10n/l10n";

/** Unified view of all other active mail accounts */
export class AllAccounts extends MailAccount {
  readonly protocol: string = "all";
  /** The list of accounts currently enabled.
   * Either same as appGlobal.emailAccounts,
   * or a subset of them based on the workspace selection. */
  accounts: Collection<MailAccount>;
  allRootFolders: Collection<Folder>;
  specialFolders = new ArrayColl<Folder>();
  rootFolders = mergeColl(this.specialFolders); // `readSavedSearches()` adds `savedSearchFolders`

  /** @param accounts typically `appGlobal.emailAccounts` */
  constructor(accounts: Collection<MailAccount>) {
    super();
    this.name = gt`All accounts`;
    this.accounts = accounts;
    this.allRootFolders = mergeColls(this.accounts.map(account => account.rootFolders));

    let all = new AllFolders(this);
    all.name = gt`All messages`;
    all.specialFolder = SpecialFolder.All;
    //all.followSpecialFolder(SpecialFolder.All);
    all.folders = mergeColls(this.accounts.map(account => account.getAllFolders()));
    this.specialFolders.add(all as any as Folder);

    let inbox = new AllFolders(this);
    inbox.name = gt`Inbox`;
    inbox.specialFolder = SpecialFolder.Inbox;
    inbox.followSpecialFolder(SpecialFolder.Inbox);
    this.specialFolders.add(inbox as any as Folder);

    let sent = new AllFolders(this);
    sent.name = gt`Sent`;
    inbox.specialFolder = SpecialFolder.Sent;
    sent.followSpecialFolder(SpecialFolder.Sent);
    this.specialFolders.add(sent as any as Folder);

    let drafts = new AllFolders(this);
    drafts.name = gt`Drafts`;
    drafts.specialFolder = SpecialFolder.Drafts;
    drafts.followSpecialFolder(SpecialFolder.Drafts);
    this.specialFolders.add(drafts as any as Folder);

    /*for (let account of accounts) {
      account.subscribe(() => this.notifyObservers());
    }*/
  }

  get isLoggedIn(): boolean {
    return true;
    //return this.accounts.contents.some(acc => acc.isLoggedIn);
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
