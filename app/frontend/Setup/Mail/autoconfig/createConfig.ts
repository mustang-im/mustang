import type { MailAccount } from "../../../../logic/Mail/MailAccount";
import { SQLAccount } from "../../../../logic/Mail/SQL/SQLAccount";
import { saveNewAccountToLocalStorage } from "../../../../logic/Mail/MailAccounts";
import { appGlobal } from "../../../../logic/app";

export async function createConfig(config: MailAccount): Promise<void> {
  appGlobal.emailAccounts.add(config);
  saveNewAccountToLocalStorage(config);
  await SQLAccount.save(config);
}
