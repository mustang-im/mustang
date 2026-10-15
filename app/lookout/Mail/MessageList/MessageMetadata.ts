import type { EMail } from "../../../logic/Mail/EMail";
import { EMailCollection } from "../../../logic/Mail/Store/EMailCollection";
import { backgroundError } from "../../../frontend/Util/error";

export class MessageMetadata {
  // Does what `EMailCollection.getIndexRange()` does for the frontend's list, which shows the collection in its own order
  static load(messages: EMail[]) {
    let byCollection = new Map<EMailCollection<EMail>, EMail[]>();
    for (let message of messages) {
      let collection = message?.folder?.messages;
      if (!(collection instanceof EMailCollection)) {
        continue;
      }
      let list = byCollection.get(collection) ?? [];
      list.push(message);
      byCollection.set(collection, list);
    }
    for (let [collection, list] of byCollection) {
      collection.readMessagesFromDB_parallel(list)
        .catch(backgroundError);
    }
  }
}
