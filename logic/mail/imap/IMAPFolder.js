import ImapClient from "emailjs-imap-client";
import IMAPAccount from "../../mail/imap/IMAPAccount";
import IMAPMessage from "../../mail/imap/IMAPMessage";
import MsgFolder from "../../account/MsgFolder";
import SQLFolder from "../../storage/SQLFolder";
import util from "../../../util/util";
util.importAll(util, global);
import { sanitize } from "../../../util/sanitizeDatatypes";

/**
 * @see <https://github.com/emailjs/emailjs-imap-client>
 * for API documentation of `ImapClient` = `conn`.
 */
export default class IMAPFolder extends MsgFolder {
  constructor(name, fullPath, account, parentFolder) {
    assert(account instanceof IMAPAccount);
    assert(!parentFolder || parentFolder instanceof IMAPFolder);
    super(name, fullPath, account);

    this.cache = new SQLFolder(this, IMAPMessage);
    this._messages = this.cache.messages;
    this._subfolders = this.cache.folders;
    this.cache.watch(this._messages, this._subfolders);
    this.cache.fetch().catch(console.error);

    /**
     * Server connection to use for this folder.
     * Use await this._connection() to get it.
     * {IMAPClient}
     */
    this._conn = null;
  }

  /**
   * @param mailbox {Folder object from the emailjs IMAP library}
   * @param account {IMAPAccount}
   * @param parent {IMAPFolder} if null: root
   */
  static fromLib(mailbox, account, parentFolder) {
    assert(account instanceof IMAPAccount);
    assert(!parentFolder || parentFolder instanceof IMAPFolder);
    let parent = parentFolder || account;

    let folder = new IMAPFolder(
        sanitize.label(sanitize.nonemptystring(mailbox.name)),
        sanitize.label(sanitize.nonemptystring(mailbox.path)),
        account,
        parentFolder);
    folder.flags = mailbox.flags.map(flag => sanitize.nonemptystring(flag).substr(1));
    folder.isNoSelect = folder.flags.indexOf("Noselect") != -1;
    if (mailbox.specialUse) {
      folder.specialUse = sanitize.nonemptystring(mailbox.specialUse).substr(1);
    }
    folder.subscribed = sanitize.boolean(mailbox.subscribed || true);

    parent._folders.set(folder.fullPath, folder);
    if (account != parent) {
      account._folders.set(folder.fullPath, folder); // TODO flat hierarchy good idea?
    }
    return folder;
  }

  async _connection() {
    if (!this._conn) {
      this._conn = await this.account._connection;
      assert(this._conn instanceof ImapClient);
    }
    return this._conn;
  }

  /**
   * Called by UI [Get Messages] and implicitly when opening a folder
   */
  async fetch() {
    await this._open();

    // Get the new messages
    let newestKnownMessageUID = 0;
    this.cache.messages.forEach(msg => {
      if (newestKnownMessageUID < msg.UID) {
        newestKnownMessageUID = msg.UID;
      }
    });
    console.log("newestKnownMessageUID", newestKnownMessageUID);
    await this.getMessagesComplete(newestKnownMessageUID + 1);

    // Download bodies of previous messages
    let toDownload = this.cache.messages.contents.filter(msg => !msg.haveBody);
    while (toDownload.length) {
      let batch = toDownload.splice(0, 100);
      let rangeSpec = batch.map(msg => msg.UID).join(",");
      await this.getMessagesComplete(rangeSpec);
    }
  }

  async fetchWithDedicatedConnection() {
    await this.account._newConnection();
    await this._open();
  }

  /**
   * @param conn {ImapClient}
   *    If you have an open connection that you want to re-use, pass this.
   *    Required.
   */
  async _open() {
    let conn = await this._connection();
    conn.onupdate = (path, type, value) => {
      if (type == "exists") {
        assert(path == this.fullPath, "Wrong mailbox selected");
        this.messageCount = sanitize.integer(mailbox.exists);
      }
    };
    let mailbox = await conn.selectMailbox(this.fullPath);
    this.messageCount = sanitize.integer(mailbox.exists);
  }

  /**
   * Gets selected headers for a number of messages at once.
   *
   * Results appear in this.messages.
   *
   * @param offset {Integer}   Skip `offset` messages at the start
   *     if null: from start
   * @param limit {Integer}   Read maximal `limit` messages
   *     if null: to end
   */
  async getMessagesMetadata(offset, limit) {
    await this._getMessages(this._offsetLimit(offset, limit), ["uid", "flags", "envelope"]);
  }

  /**
   * Gets the body for a number of messages at once.
   */
  async getMessagesBodies(offset, limit) {
    await this._getMessages(this._offsetLimit(offset, limit), ["uid", "flags", "envelope", "bodystructure"]);
  }

  /**
   * Gets the entire message including attachments
   * for a number of messages at once.
   * Gets the raw MIME source, if possible.
   */
  async getMessagesComplete(offset, limit) {
    await this._getMessages(this._offsetLimit(offset, limit), ["uid", "flags", "envelope", "body.peek[]"]);
  }

  _offsetLimit(offset, limit) {
    if (typeof(offset) == "string" && (offset.includes(",") || offset.includes(":"))) {
      return offset; // range spec like "1,2,5" or "1,4,50:60,100:"
    }
    assert(!offset || typeof(offset) == "number");
    assert(!limit || typeof(limit) == "number");
    if (!offset) {
      offset = 1;
    }
    return offset + ":" + (limit ? String(offset + limit) : "*");
  }

  /**
   * @param queryProperties {string}   which results you need, e.g. ["uid", "envelope"]
   * @param messageList {string}   UID list, e.g. "1,4:10,45"
   */
  async _getMessages(messageList, queryProperties) {
    let conn = await this._connection();
    let messages = await conn.listMessages(
        this.fullPath, messageList, queryProperties, { byUid: true });
    for (let message of messages) {
      try {
        let msg = IMAPMessage.fromLib(message, this);
        this._messages.set(msg.msgID, msg);
        await wait(0);
      } catch (ex) {
        console.error(ex); // TODO
      }
    }
  }

  /**
   * Creates a new message and appends it to this folder.
   * @returns {EMail}
   */
  async createMessage() {
    return new IMAPMessage(this);
  }

  /**
   * Returns a UID list for the IMAP server.
   * Example:
   * - "4" = a single message
   * - "1,3,5" = selected messages
   * - "1,3:10,45" = selected messages (not yet implemented)
   * - "1:*" = all messages (not needed here)
   * @returns {string}
   */
  _UIDs(messages) {
    // Later: Could merge consecutive UIDs to "1,3:10,45"
    return messages.map(msg => msg.UID).join(",");
  }

  /**
   * Bulk delete multiple messages.
   * @param messages {Array of EMail}
   * @param toTrash {boolean}
   *      true: Move to trash
   *      false: Immedaite permanent delete
   */
  async deleteMessages(messages, toTrash) {
    assert(messages.every(msg => msg.folder == this));
    let conn = await this._connection();
    let UIDs = this._UIDs(messages);

    // Delete from server
    await conn.deleteMessages(this.fullPath, UIDs);

    // Delete in our lists
    // This will also delete form the DB
    this._messages.removeAll(messages);
  }

  /**
   * Bulk copy multiple messages to another folder.
   * @param messages {Array of EMail}
   * @param targetFolder {MsgFolder}   Where to move them
   */
  async copyMessages(messages, targetFolder) {
    assert(targetFolder instanceof MsgFolder);
    assert(messages.every(msg => msg.folder == this));
    let conn = await this._connection();
    let UIDs = this._UIDs(messages);

    // Delete from server
    await conn.copyMessages(this.fullPath, UIDs, { byUid: true });

    // Delete in our lists
    // This will also delete form the DB
    this._messages.removeAll(messages);

    // TODO Get new UIDs
    for (let message in messages) {
      message.folder = targetFolder;
      message.UID = null;
    }
    this.targetFolder.messages.addAll(messages);
  }

  /**
   * Bulk move multiple messages to another folder.
   * @param messages {Array of EMail}
   * @param targetFolder {MsgFolder}   Where to move them
   */
  async moveMessages(messages, targetFolder) {
    assert(targetFolder instanceof MsgFolder);
    assert(messages.every(msg => msg.folder == this));
    let conn = await this._connection();
    let UIDs = this._UIDs(messages);

    // Delete from server
    await conn.copyMessages(this.fullPath, UIDs, { byUid: true });

    // TODO Get new UIDs
    for (let message in messages) {
      message.folder = targetFolder;
      message.UID = null;
    }
    this.targetFolder.messages.addAll(messages);
  }

  /**
   * Bulk update the flags of multiple messages.
   * @param messages {Array of EMail}
   * @param flags {
   *    read {boolean}
   *    starred {boolean}
   * }
   *     If a property is undefined, it won't be changed.
   *     If a property is a boolean, all messages will be changed to this value.
   */
  async updateMessagesMetadata(messages, flags) {
    assert(messages.every(msg => msg.folder == this));
    let conn = await this._connection();
    let UIDs = this._UIDs(messages);+
    console.log(flags);

    if (flags.read === true || flags.starred === true) {
      let mod = {
        set: [],
      };
      if (flags.read === true) {
        mod.set.push("\\Seen");
      }
      if (flags.starred === true) {
        mod.set.push("\\Flagged");
      }
      console.log(mod);
      await conn.setFlags(this.fullPath, UIDs, mod);
    }

    if (flags.read === false || flags.starred === false) {
      let mod = {
        remove: [],
      };
      if (flags.read === false) {
        mod.remove.push("\\Seen");
      }
      if (flags.starred === false) {
        mod.remove.push("\\Flagged");
      }
      console.log(mod);
      await conn.setFlags(this.fullPath, UIDs, mod);
    }
  }

  /**
   * Delete this folder from server and locally.
   * Also deletes all messages in it.
   *
   * @param toTrash {boolean}   Just move it to Trash
   */
  async deleteFolder(toTrash) {
    let conn = await this._connection();

    // Delete on server
    await conn.deleteMailbox(this.fullPath);

    // Delete in our lists
    // This will also delete from the DB
    if (this.parentFolder) {
      this.parentFolder.folders.remove(this);
    }
    this.account.folders.remove(this);
  }

  /**
   * Move this folder.
   *
   * @param newParent {MsgFolder}
   */
  async moveFolder(newParent) {
    let conn = await this._connection();
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
    let conn = await this._connection();
    throw new ImplementThis();
  }

  async emptyTrash() {
    throw new ImplementThis();
  }
}
