import { ExchangeSearchEMail } from "../EWS/ExchangeSearchEMail";
import { type GraphAccount, kMaxFetchCount } from "./GraphAccount";
import type { GraphFolder } from "./GraphFolder";
import { type TGraphEMail, TGraphEMailHeaderProperties } from "./TGraphMail";
import type { EMail } from "../EMail";
import { ArrayColl } from "svelte-collections";

/** Sends the AQS search @see `ExchangeSearchEMail` as MS Graph `$search`.
 * <https://learn.microsoft.com/en-us/graph/search-query-parameter>
 * Graph accepts either `$search` or `$filter`, but not both,
 * and only `$search` matches the message body. */
export class GraphSearchEMail extends ExchangeSearchEMail {
  declare account: GraphAccount;

  async startSearch(limit?: number): Promise<ArrayColl<EMail>> {
    let results = new ArrayColl<EMail>();
    let queryString = this.queryString();
    if (!queryString) {
      return results;
    }
    let searchedFolder = this.folder as GraphFolder;
    let properties = TGraphEMailHeaderProperties.concat("parentFolderId");
    let messagesJSON = await this.account.graphGet<TGraphEMail>(
      `${searchedFolder ? searchedFolder.path + "/" : ""}messages` +
      `?$search=${encodeURIComponent(`"${queryString}"`)}` +
      `&$select=${properties.join(",")}`,
      { top: limit ?? kMaxFetchCount });

    let folders = this.account.getAllFolders() as ArrayColl<GraphFolder>;
    for (let json of messagesJSON) {
      let folder = searchedFolder ?? folders.find(folder => folder.id == json.parentFolderId);
      if (!folder) {
        continue; // in a folder that we do not know
      }
      let { newMessages, updatedMessages } = folder.parseMessageList([json]);
      results.addAll(updatedMessages);
      results.addAll(newMessages);
    }
    return results;
  }
}
