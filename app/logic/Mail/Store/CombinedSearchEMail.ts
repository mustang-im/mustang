import { SearchEMail } from "./SearchEMail";
// #if [!WEBMAIL]
import { SQLSearchEMail } from "../SQL/SQLSearchEMail";
// #endif
import type { EMail } from "../EMail";
import { appGlobal } from "../../app";
import { backgroundError } from "../../../frontend/Util/error";
import { ArrayColl, SetColl } from "svelte-collections";

/** Runs the local database search and the server-side search of each account in
 * parallel, and combines their results. Each of them finds emails that the others
 * miss: the database knows only what we downloaded, each server only its own account. */
export class CombinedSearchEMail extends SearchEMail {
  async startSearch(limit?: number): Promise<ArrayColl<EMail>> {
    let searches = new ArrayColl<SearchEMail>();
    let dbSearch: SearchEMail = null;
    // #if [!WEBMAIL]
    dbSearch = new SQLSearchEMail();
    dbSearch.copyFrom(this);
    searches.add(dbSearch);
    // #endif
    let onlyAccount = this.account ?? this.folder?.account;
    for (let account of onlyAccount ? [onlyAccount] : appGlobal.emailAccounts) {
      let serverSearch = account.newSearchEMail();
      if (!serverSearch) {
        continue;
      }
      serverSearch.copyFrom(this);
      serverSearch.account = account;
      searches.add(serverSearch);
    }

    /** A search without a limit may read the whole database, but must not
     * download whole mailboxes, e.g. every email that has an attachment. */
    const kMaxServerResults = 500;
    let serverLimit = limit ?? kMaxServerResults;
    let results = new ArrayColl<EMail>();
    await Promise.all(searches.contents.map(async search => {
      try {
        results.addAll(await search.startSearch(search == dbSearch ? limit : serverLimit));
      } catch (ex) {
        backgroundError(ex); // The other searches should still return their results
      }
    }));

    // The same email is often found by several of the searches
    let found = new SetColl<string | EMail>();
    let unique = new ArrayColl<EMail>();
    for (let email of results.sortBy(email => -(email.sent?.getTime() ?? 0))) {
      // Without an ID, we cannot tell whether another search found it, too
      let id = email.pID ?? email.messageID;
      let key = id
        ? `${email.folder?.account?.id}\n${email.folder?.id}\n${id}`
        : email;
      if (found.has(key)) {
        continue;
      }
      found.add(key);
      unique.add(email);
      if (limit && unique.length >= limit) {
        break;
      }
    }
    return unique;
  }
}
