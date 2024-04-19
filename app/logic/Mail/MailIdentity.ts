import { Observable, notifyChangedProperty } from "../util/Observable";

export class MailIdentity extends Observable {
  id: string;
  @notifyChangedProperty
  userRealname: string;
  @notifyChangedProperty
  emailAddress: string;
  @notifyChangedProperty
  replyTo: string | null = null;
  organisation: string | null = null;
  /** email addresses that should be CCed on every outgoing email */
  sendCC: string[] = [];
  /** email addresses that should be CCed on every outgoing email */
  sendBCC: string[] = [];
  /** Not including signature markers like `-- ` or `footer`,
   * and not including the Mustang signature */
  signatureHTML: string | null = null;
}
