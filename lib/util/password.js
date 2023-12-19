/*************************
 * name: Password encryption
 * description: Encrypts and descripts passwords using Buttercup
 * copyright: Ben Bucksch of Beonex
 * license: MIT
 * version: 0.1
 ****************************/

import Credentials from "@buttercup/credentials";
import { myPrefs, savePrefs } from "./preferences";
import generatePassword from 'generate-password';

async function getKey() {
  var random = myPrefs.get("passwords-key", null);
  if (!random) {
    random = generatePassword.generate({ length: 20, numbers: true, symbols: true });
    myPrefs.set("passwords-key", random);
    savePrefs();
  }
  return random;
}

/**
 * @params plainPassword {String} a plaintext password from the user
 * @returns {String} a pseudo-encrypted string to store on local disk.
 *     Not secure enough to exposed to untrusted parties.
 */
export async function encryptPassword(plainPassword) {
  var key = await getKey();
  var credentials = new Credentials({ password: plainPassword });
  return await credentials.toSecureString(key);
}

/**
 * @params encryptedPassword {String}  a pseudo-encrypted string
 * @returns {String} the plaintext password
 */
export async function decryptPassword(encryptedPassword) {
  var key = await getKey();
  var credentials = await Credentials.fromSecureString(encryptedPassword, key);
  return credentials.password;
}

module.exports = {
  encryptPassword: encryptPassword,
  decryptPassword: decryptPassword,
};
