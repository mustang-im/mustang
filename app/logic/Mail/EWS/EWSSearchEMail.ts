import { ExchangeSearchEMail } from "./ExchangeSearchEMail";
import type { EWSAccount } from "./EWSAccount";
import { type EWSFolder, getEWSItems, kMaxCount } from "./EWSFolder";
import { EWSItemError } from "./EWSError";
import type { EMail } from "../EMail";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ensureArray } from "../../util/util";
import { ArrayColl } from "svelte-collections";

/** Sends the AQS search @see `ExchangeSearchEMail` as EWS `FindItem`.
 * <https://learn.microsoft.com/en-us/exchange/client-developer/web-service-reference/finditem-operation> */
export class EWSSearchEMail extends ExchangeSearchEMail {
  declare account: EWSAccount;

  async startSearch(limit?: number): Promise<ArrayColl<EMail>> {
    let results = new ArrayColl<EMail>();
    let queryString = this.queryString();
    if (!queryString) {
      return results;
    }
    let folders = (this.folder ? [this.folder] : this.account.getAllFolders().contents) as EWSFolder[];
    let request = {
      m$FindItem: {
        m$ItemShape: {
          t$BaseShape: "IdOnly",
          t$AdditionalProperties: {
            t$FieldURI: [{
              FieldURI: "item:ParentFolderId",
            }],
          },
        },
        m$IndexedPageItemView: {
          BasePoint: "Beginning",
          Offset: 0,
          MaxEntriesReturned: limit ?? kMaxCount,
        },
        m$SortOrder: {
          t$FieldOrder: {
            Order: "Descending",
            t$FieldURI: {
              FieldURI: "item:DateTimeSent",
            },
          },
        },
        m$ParentFolderIds: {
          t$FolderId: folders.map(folder => ({ Id: folder.id })),
        },
        m$QueryString: queryString,
        Traversal: "Shallow",
      },
    };
    let items: any[] = [];
    for (let response of ensureArray(await this.account.callEWS(request))) { // 1 per folder
      if (response.ResponseClass == "Error") {
        throw new EWSItemError(response, request);
      }
      if (response.RootFolder?.Items) {
        items = items.concat(getEWSItems(response.RootFolder.Items));
      }
    }

    for (let folder of folders) {
      let newItemIDs: any[] = [];
      for (let item of items) {
        if (item.ParentFolderId?.Id != folder.id) {
          continue;
        }
        let itemID = sanitize.nonemptystring(item.ItemId.Id);
        if (folder.deletions.has(itemID)) {
          continue;
        }
        let email = folder.getEmailByItemID(itemID);
        if (email) {
          results.add(email);
        } else {
          newItemIDs.push(item.ItemId);
        }
      }
      results.addAll(await folder.getNewMessageHeaders(newItemIDs));
    }
    return results;
  }
}
