import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { encrypt, decrypt } from 'password-salt';

const secret = 'anything'; // Lib adds a 32-byte salt, which acts as password
// 32^256 values should be sufficient against rainbow tables

export async function passwordDecrypt(encrypted: string | null | undefined): Promise<string | null> {
  return encrypted != null ? sanitize.string(await decrypt(secret, encrypted) as string, null) : null;
}

export async function passwordEncrypt(password: string | null | undefined): Promise<string | null> {
  return password != null ? await encrypt(secret, password) : null;
}
