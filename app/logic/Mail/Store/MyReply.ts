import { SpecialFolder } from "../Folder";
import type { EMail } from "../EMail";
import { newLocalSearchEMail } from "./setStorage";
import { webMail } from "../../build";
import { ArrayColl } from "svelte-collections";

export class MyReply {
  static async find(original: EMail): Promise<EMail | null> {
    let account = original.folder?.account;
    if (!original.messageID || !account) {
      return null;
    }
    let isInSent = (email: EMail) => email.folder?.specialFolder == SpecialFolder.Sent;
    let isMyReply = (email: EMail) => email.inReplyTo == original.messageID &&
      (email.outgoing || isInSent(email));
    let replies = new ArrayColl<EMail>();
    for (let folder of account.getAllFolders()) {
      replies.addAll(folder.messages.filterOnce(isMyReply));
    }
    if (!replies.find(isInSent) && !webMail) {
      let dbSearch = newLocalSearchEMail();
      dbSearch.account = account;
      dbSearch.inReplyTo = original.messageID;
      replies.addAll((await dbSearch.startSearch()).filterOnce(isMyReply));
    }
    // A reply that was just sent is only on the server, until the next sync of the Sent folder
    let serverSearch = replies.isEmpty ? account.newSearch() : null;
    if (serverSearch) {
      serverSearch.folder = account.getSpecialFolder(SpecialFolder.Sent);
      serverSearch.inReplyTo = original.messageID;
      replies.addAll((await serverSearch.startSearch()).filterOnce(isMyReply));
    }
    let latestFirst = replies.contents.sort((a, b) =>
      (b.sent?.getTime() ?? 0) - (a.sent?.getTime() ?? 0));
    return latestFirst.find(isInSent) ?? latestFirst[0] ?? null;
  }
}
