import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { encrypt, decrypt } from 'password-salt';

const secret = 'anything'; // Lib adds a 32-byte salt, which acts as password
// 32^256 values should be sufficient against rainbow tables

export async function getPassword(account: string): Promise<string | null> {
  let encrypted = sanitize.string(localStorage.getItem(getKey(account)), null);
  if (!encrypted) {
    return null;
  }
  return sanitize.string(await decrypt(secret, encrypted) as string, null);
}

export async function setPassword(account: string, password: string): Promise<void> {
  let encrypted = await encrypt(secret, password);
  localStorage.setItem(getKey(account), encrypted);
}

export async function deletePassword(account: string): Promise<void> {
  localStorage.removeItem(getKey(account));
}

function getKey(account: string): string {
  return "password." + account;
}
