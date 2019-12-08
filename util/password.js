/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 * Not any newer versions of these licenses
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Corvette
 *
 * The Initial Developer of the Original Code is
 *  Ben Bucksch <ben.bucksch beonex.com>
 * Portions created by the Initial Developer are Copyright (c) 2019
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const Credentials = require("@buttercup/credentials");
const preferences = require("./preferences");
const generatePassword = require('generate-password');

async function getKey() {
  var random = preferences.myPrefs.get("passwords-key", null);
  if (!random) {
    random = generatePassword.generate({ length: 20, numbers: true, symbols: true });
    preferences.myPrefs.set("passwords-key", random);
    preferences.savePrefs();
  }
  return random;
}

/**
 * @params plainPassword {String} a plaintext password from the user
 * @returns {String} a pseudo-encrypted string to store on local disk.
 *     Not secure enough to exposed to untrusted parties.
 */
async function encryptPassword(plainPassword) {
  var key = await getKey();
  var credentials = new Credentials({ password: plainPassword });
  return await credentials.toSecureString(key);
}

/**
 * @params encryptedPassword {String}  a pseudo-encrypted string
 * @returns {String} the plaintext password
 */
async function decryptPassword(encryptedPassword) {
  var key = await getKey();
  var credentials = await Credentials.fromSecureString(encryptedPassword, key);
  return credentials.password;
}

module.exports = {
  encryptPassword : encryptPassword,
  decryptPassword : decryptPassword,
};
