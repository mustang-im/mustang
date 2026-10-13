import { MailAccount, DeleteStrategy } from "../MailAccount";
import { TLSSocketType } from "../../Abstract/TCPAccount";
import { Calendar } from "../../Calendar/Calendar";
import { ExchangeCalendar } from "../../Calendar/EWS/ExchangeCalendar";
import type { PersonUID } from "../../Abstract/PersonUID";
import { kOtherMailboxConfig, parseOtherMailboxes } from "./ExchangeUserConfiguration";
import { appGlobal } from "../../app";
import { ArrayColl, Collection } from "svelte-collections";

export class ExchangeMailAccount extends MailAccount {
  readonly port: number = 443;
  readonly tls = TLSSocketType.TLS;
  readonly canSendOutgoingInvitations: boolean = false;
  deleteStrategy: DeleteStrategy = DeleteStrategy.MoveToTrash;

  get calendarsAvailable(): Collection<Calendar> {
    let mailboxCalendars = this.calendarsOfMailbox(this.username);
    if (mailboxCalendars.hasItems) {
      return mailboxCalendars;
    }
    if (this.isDependentAccount) {
      let delegateCalendars = this.calendarsOfMailbox(this.mainAccount.username);
      if (delegateCalendars.hasItems) {
        return delegateCalendars;
      }
    }
    return appGlobal.calendars.filterObservable(cal => cal.canAcceptAnyInvitation);
  }

  /** A mailbox shared with us and its calendars are siblings, not our dependent accounts. */
  protected calendarsOfMailbox(username: string): ArrayColl<Calendar> {
    return (this.mainAccount ?? this).dependentAccounts().filterObservable(acc =>
      acc instanceof ExchangeCalendar &&
      acc.useForInvitations &&
      acc.username == username) as ArrayColl<Calendar>;
  }

  async availableSharedAccounts(): Promise<ArrayColl<PersonUID>> {
    let persons = new ArrayColl<PersonUID>();
    if (this.mainAccount) {
      return persons;
    }
    let xml = await this.getUserConfigurationXML(kOtherMailboxConfig, "root");
    for (let person of parseOtherMailboxes(xml)) {
      if (this.isMyEMailAddress(person.emailAddress) ||
          this.dependentAccounts().contents.some(account => account.protocol == this.protocol &&
            (account as MailAccount).isMyEMailAddress(person.emailAddress))) {
        continue;
      }
      persons.add(person);
    }
    return persons;
  }

  async getUserConfigurationXML(name: string, distinguishedFolderID: string): Promise<string | null> {
    return null;
  }

  async deleteIt(): Promise<void> {
    if (this.isDependentAccount) {
      let dependentOfDelegate = this.mainAccount.dependentAccounts()
        .filterOnce(acc => acc != this && acc.username == this.username);
      for (let sibling of dependentOfDelegate) {
        await sibling.deleteIt();
      }
    }
    await super.deleteIt();
  }
}
