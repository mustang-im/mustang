import { Calendar } from "../Calendar";
import type { WorkHours } from "../WorkHours";
import { ExchangeWorkHours } from "./ExchangeWorkHours";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { AbstractFunction } from "../../util/util";

export class ExchangeCalendar extends Calendar {
  /** Exchange's calendar can only accept incoming invitations from its inbox */
  readonly canAcceptAnyInvitation = false;
  /** Is this the default calendar that handles incoming invitations */
  useForInvitations: boolean = false;

  get isOtherPersonsCalendar(): boolean {
    let account = this.mainAccount;
    return !!account && (this.username != account.username || !!account.mainAccount);
  }

  get canSaveWorkHoursOnServer(): boolean {
    return !this.isOtherPersonsCalendar;
  }

  get canSaveWorkHoursPerDayOnServer(): boolean {
    return false;
  }

  async readWorkHoursFromServer(): Promise<void> {
    if (this.isOtherPersonsCalendar) {
      await this.setWorkHoursFromServer(await this.fetchOtherPersonsWorkHours());
      return;
    }
    let xml = await this.fetchWorkHoursXML();
    let serverHours = xml ? ExchangeWorkHours.fromXML(xml) : null;
    if (!serverHours || this.workHours && serverHours.isSummaryOf(this.workHours)) {
      return;
    }
    await this.setWorkHoursFromServer(serverHours.toWorkHours());
  }

  protected async saveWorkHoursToServer(): Promise<void> {
    if (!this.canSaveWorkHoursOnServer || !this.workHours) {
      return;
    }
    let previousXML = await this.fetchWorkHoursXML();
    let xml = ExchangeWorkHours.fromWorkHours(this.workHours).toXML(previousXML);
    await this.saveWorkHoursXML(xml, previousXML == null);
  }

  /** The user configuration `WorkHours` of the calendar folder
   * @returns null, if it does not exist */
  protected async fetchWorkHoursXML(): Promise<string | null> {
    throw new AbstractFunction();
  }

  protected async saveWorkHoursXML(xml: string, isNew: boolean): Promise<void> {
    throw new AbstractFunction();
  }

  /** From the free/busy information of the owner of this calendar */
  protected async fetchOtherPersonsWorkHours(): Promise<WorkHours | null> {
    throw new AbstractFunction();
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.useForInvitations = sanitize.boolean(json.useForInvitations, false);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.useForInvitations = this.useForInvitations;
    return json;
  }
}
