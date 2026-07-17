/** logout() must stop everything running on the account, so deleting an account
 * (Account.deleteIt → logout) leaves no process that could re-persist it and bring
 * it back after a restart. */
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { SignalAccount } from "../../../../logic/Chat/Signal/SignalAccount";
import { expect, test } from "vitest";

test("logout() closes the connection and cancels history transfer + linking", async () => {
  let account = new SignalAccount();
  let disconnected = false;
  account.connection = { disconnect: () => { disconnected = true; } } as any;
  account.isOnline = true;
  let transferCancelled = false;
  (account as any).backupImport = { cancel: () => { transferCancelled = true; } };
  let linkingCancelled = false;
  (account as any).provisioning = { cancel: () => { linkingCancelled = true; } };

  await account.logout();

  expect(disconnected).toBe(true);          // websocket (+ keepalive) closed
  expect(account.connection).toBe(null);
  expect(account.isOnline).toBe(false);     // background syncs check this and stop
  expect(transferCancelled).toBe(true);     // history-transfer long-poll stopped
  expect(linkingCancelled).toBe(true);      // provisioning socket closed
  expect((account as any).provisioning).toBe(null);
});
