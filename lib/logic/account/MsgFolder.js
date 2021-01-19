import util from "../../util/util";
util.importAll(util, global);
import Account from "../account/Account";
import EMail from "../mail/EMail";
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
 * @param parentFolder {MsgFolder}
 *     if null: root folder
 */
export default class MsgFolder {
  constructor(name, fullPath, account, parentFolder) {
    assert(account instanceof Account);
    assert(!parentFolder || parentFolder instanceof MsgFolder);
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
      * if null: root folder
      * {MsgFolder}
      */
    this.parentFolder = parentFolder;

    /**
     * {MapColl of MessageID -> EMail}
     */
    this._messages = new MapColl();

    /**
     * {MapColl of name -> MsgFolder}
     */
    this._folders = new MapColl();

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
   * {Collection of EMail}
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
    return this._folders;
  }

  /**
   * Checks for new mail on the server,
   * and downloads the mails.
   *
   * @param state {JSON} the return value from the last invokation of `fetch`
   * @return state {JSON} pass this as `state` to the next invokation of `fetch`
   */
  async fetch(state) {
    throw new ImplementThis();
  }

  /**
   * Gets selected headers for a number of messages at once.
   *
   * Results appear in this.messages.
   */
  async getMessagesMetadata(offset, limit) {
    throw new ImplementThis();
  }

  /**
   * Gets the body for a number of messages at once.
   */
  async getMessagesBodies(offset, limit) {
    throw new ImplementThis();
  }

  /**
   * Gets the entire message including attachments
   * for a number of messages at once.
   * Gets the raw MIME source, if possible.
   */
  async getMessagesComplete(offset, limit) {
    throw new ImplementThis();
  }

  /**
   * Creates a new message and appends it to this folder.
   * @returns {EMail}
   */
  async createMessage() {
    throw new ImplementThis();
    return new EMail(this);
  }

  /**
   * Bulk delete multiple messages.
   * @param messages {Array of EMail}
   * @param toTrash {boolean}
   *      true: Move to trash
   *      false: Immediate permanent delete
   */
  async deleteMessages(messages, toTrash) {
    assert(messages.every(msg => msg.folder == this));
    throw new ImplementThis();
  }

  /**
   * Bulk copy multiple messages to another folder.
   * @param messages {Array of EMail}
   * @param targetFolder {MsgFolder}   Where to move them
   */
  async copyMessages(messages, targetFolder) {
    assert(targetFolder instanceof MsgFolder);
    assert(messages.every(msg => msg.folder == this));
    throw new ImplementThis();
  }

  /**
   * Bulk move multiple messages to another folder.
   * @param messages {Array of EMail}
   * @param targetFolder {MsgFolder}   Where to move them
   */
  async moveMessages(messages, targetFolder) {
    assert(targetFolder instanceof MsgFolder);
    assert(messages.every(msg => msg.folder == this));
    throw new ImplementThis();
  }

  /**
   * Bulk update the flags of multiple messages.
   * @param messages {Array of EMail}
   * @param flags {
   *    read {boolean}
   *    starred {boolean}
   * }
   *     If a property is undefined, it won't be changed.
   *     if a property is a boolean, all messages will be changed to this value.
   */
  async updateMessagesMetadata(messages, flags) {
    assert(messages.every(msg => msg.folder == this));
    throw new ImplementThis();
  }

  /**
   * Delete this folder from server and locally.
   * Also deletes all messages in it.
   *
   * @param toTrash {boolean}   Just move it to Trash
   */
  async deleteFolder(toTrash) {
    throw new ImplementThis();
  }

  /**
   * Move this folder.
   *
   * @param newParent {MsgFolder}
   */
  async moveFolder(newParent) {
    throw new ImplementThis();
  }

  /**
   * Give a new user-visible name.
   *
   * Note: This may also implicitly change the fullPath.
   *
   * @param newName {string}
   */
  async renameFolder(newName) {
    throw new ImplementThis();
  }

  async emptyTrash() {
    throw new ImplementThis();
  }
}
