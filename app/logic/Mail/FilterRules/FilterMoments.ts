/** Defines *when* a filter action should happen */
export enum FilterMoment {
  /** When a new mail arrives, before the spam filter checked it */
  IncomingBeforeSpam = "incoming-before-spam",
  /** When a new mail arrives, after the spam filter checked it */
  IncomingAfterSpam = "incoming-after-spam",
  /** When the user sent an email. Acts on the outgoing emails. */
  Outgoing = "outgoing",
}
