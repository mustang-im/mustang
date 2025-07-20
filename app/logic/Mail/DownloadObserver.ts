import { EMail } from "./EMail";
import { CollectionObserver, Collection } from "svelte-collections";

export class DownloadObserver extends CollectionObserver<EMail> {
  condition: (email: EMail) => boolean;
  constructor(condition: (email: EMail) => boolean) {
    super();
    this.condition = condition;
  }

  added(emails: EMail[]) {
    if (emails instanceof Collection) {
      emails = emails.contents;
    }
    console.log("added emails", emails.map(e => e.subject));
    let emailsSelected = emails.filter(this.condition);
    if (!emailsSelected[0]) {
      return;
    }
    let errorCallback = emailsSelected[0].folder.account.errorCallback;
    for (let email of emailsSelected) {
      if (email.downloadComplete) {
        continue;
      }
      console.log("Downloading email", email.received?.toISOString().substring(0, 10), email.subject);
      email.download()
        .catch(errorCallback);
    }
  }

  removed(emails: EMail[]) {
  }
}
