import { ChatPersonUID } from "../ChatPersonUID";

export class GraphChatPerson extends ChatPersonUID {
  constructor(userID: string, name?: string) {
    super("graph", userID, name);
  }
}
