import util from "../../util/util";
util.importAll(util, global);
import Account from "../account/Account";
import RFC822Mail from "../mail/MIME";
import { sanitize } from "../../util/sanitizeDatatypes";


/**
 * This contains a list of messages.
 * It represents e.g.
 * - IMAP folder
 * - POP3 inbox
 * - local mbox
 * - NNTP newsgroup
 * - RSS news feed
 *
 * @param name {String}   Folder name
 *     This is not the full path, but just the name of this one folder.
 * @param fullPath {String}   folder name within the account
 *     This is the full path, including delimiters.
 *     The delimiter depends on the account and server, it may be "/" or "."
 *     or backslash or something else.
 *     Not including the account.
 * @param account {Account}
 */
export default class MsgFolder {
  constructor(name, fullPath, account) {
    assert(account instanceof Account);
    this.account = account;

    /**
     * @see ctor
     * {String}
     */
    this.name = sanitize.label(sanitize.nonemptystring(name));

    /**
     * @see ctor
     * {String}
     */
    this.fullPath = sanitize.nonemptystring(fullPath);

    /**
     * {MapColl of MessageID -> RFC822Mail}
     */
    this._messages = new MapColl();

    /**
     * {MapColl of name -> MsgFolder}
     */
    this._subfolders = new MapColl();

    /**
    * Total number of messages in this folder
     * {Integer}
     */
    this.messageCount = 0;

    /**
     * Number of new (unseen) messages in this folder
     * {Integer}
     */
    this.newMessageCount = 0;
  }

  /**
   * The messages in this folder.
   *
   * To sync the locally cached list with the server,
   * call sync(). The collection here will then be
   * updated using the listeners.
   *
   * {Collection of RFC822Mail}
   */
  get messages() {
    return this._messages;
  }

  /**
   * Subfolders folders of this folder.
   * {Collection of MsgFolder}
   * Empty list, if there are no subfolders.
   */
  get folders() {
    return this._subfolders;
  }

  /**
   * Checks for new mail on the server,
   * and downloads the mails.
   */
  async fetch() {
    throw new ImplementThis();
  }
}
