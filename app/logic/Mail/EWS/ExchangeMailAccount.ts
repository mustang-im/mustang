import { MailAccount } from "../MailAccount";
import { TLSSocketType } from "../../Abstract/TCPAccount";
import { Calendar } from "../../Calendar/Calendar";
import { ExchangeCalendar } from "../../Calendar/EWS/ExchangeCalendar";
import { appGlobal } from "../../app";
import { ArrayColl, Collection } from "svelte-collections";

export class ExchangeMailAccount extends MailAccount {
  readonly port: number = 443;
  readonly tls = TLSSocketType.TLS;
  readonly canSendOutgoingInvitations: boolean = false;

  get calendarsAvailable(): Collection<Calendar> {
    let dependentCalendars = this.dependentAccounts().filterObservable(acc => acc instanceof ExchangeCalendar && acc.useForInvitations) as ArrayColl<Calendar>;
    return dependentCalendars?.hasItems
      ? dependentCalendars
      : appGlobal.calendars.filterObservable(cal => cal.canAcceptAnyInvitation);
  }
}
