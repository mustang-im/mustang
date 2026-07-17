import { ChatPersonUID } from "../ChatPersonUID";

export class XMPPPerson extends ChatPersonUID {
  constructor(userID: string, name?: string) {
    super("xmpp", userID, name);
  }
}
