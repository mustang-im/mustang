import type { EMail } from "./EMail";
import { CreateMIME } from "./SMTP/CreateMIME";

/** One composer's in-progress email, saved as MIME for crash recovery. */
export interface DraftRecoveryRecord {
  /** = `EMail.messageID`, unique per composer, and the object store key */
  messageID: string;
  /** `MailAccount.id`, to restore the draft into the same account */
  accountID: string;
  /** Full RFC822 MIME source of the composed email */
  mime: Uint8Array;
  savedAt: Date;
}

/**
 * Keeps a copy of each open composer's email in the browser's IndexedDB,
 * so that a draft survives a crash or an unexpected shutdown.
 *
 * This is *not* the normal draft: those are saved explicitly to the account's
 * Drafts folder. This is a local, seamless safety net. The composer saves here
 * on a debounce while editing, and deletes the record when the window is closed
 * cleanly (send, save as draft, or discard), so records don't accumulate.
 * @see MailInBackground.svelte restores whatever is left over on the next start.
 */
class DraftRecovery {
  protected dbPromise: Promise<IDBDatabase> | null = null;

  protected openDB(): Promise<IDBDatabase> {
    return this.dbPromise ??= new Promise((resolve, reject) => {
      let request = indexedDB.open("draft-recovery", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("drafts", { keyPath: "messageID" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  protected async run<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    let db = await this.openDB();
    return await new Promise<T>((resolve, reject) => {
      let request = operation(db.transaction("drafts", mode).objectStore("drafts"));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async save(email: EMail): Promise<void> {
    if (!email.messageID) {
      email.compose.generateMessageID();
    }
    let record: DraftRecoveryRecord = {
      messageID: email.messageID,
      accountID: email.folder?.account?.id ?? email.identity?.account?.id,
      mime: await CreateMIME.getMIME(email),
      savedAt: new Date(),
    };
    await this.run("readwrite", store => store.put(record));
  }

  async delete(email: EMail): Promise<void> {
    if (!email.messageID) {
      return;
    }
    await this.run("readwrite", store => store.delete(email.messageID));
  }

  async getAll(): Promise<DraftRecoveryRecord[]> {
    return await this.run("readonly", store => store.getAll());
  }
}

export const draftRecovery = new DraftRecovery();
