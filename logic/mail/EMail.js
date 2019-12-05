import MsgFolder from "../account/MsgFolder";

/**
 * An RFC822 message with
 * - Subject
 * - Author email address
 * - Author realname, if given
 * - Author (full From: line)
 * - First part of plaintext body
 * - Message ID
 */
export default class EMail {
  /**
   * @param folder {MsgFolder}   The folder where the message is stored.
   *     May be null for new messages. Certain function will then throw.
   */
  constructor(folder) {
    assert(!folder || folder instanceof MsgFolder);
    this.folder = folder;

    this.date = new Date();

    // Message-ID header
    this.msgID = null;

    // In-Reply-To header
    this.parentMsgID = null;

    /**
     * IMAP UID
     * Unique stable ID of the message within a folder.
     * Set by IMAP server.
     * {Integer}
     */
    this.UID = null;

    // Title of the email, set by author
    this.subject = null;

    /**
     * From:
     */
    this.authorEmailAddress = null;

    /**
     * Only the realname portion of From:
     * As set by author. If not given, this is the email address.
     */
    this.authorRealname = null;

    /**
     * Complete From: header content
     */
    this.authorFull = null;

    /**
     * To:
     */
    this.recipientEmailAddress = null;

    this.recipientRealname = null;

    this.contentType = null;

    this._body = null;


    // mutable meta data

    this.isRead = false;

    this.isStarred = false;
  }

  async body() {
    return this._body;
  }

  /**
   * Wheather the message has been read or not
   * @param read {Boolean}
   *   true: mark as read
   *   false: mark as unread
   *   not passed (undefined): mark as read
   */
  async markAsRead(read) {
    if (read === undefined) {
      read = true;
    }
    this.isRead = read;
    console.log("Marking message " + this.subject + " " + this.msgID + " as read");
    await this.folder.updateMessagesMetadata([ this ], { read: read } );
    return read;
  }

  /**
   * Wheather the message has been marked as flagged or not
   * @param starred {Boolean}
   *   true: flagged
   *   false: not flagged
   *   not passed (undefined): flagged
   */
  async star(starred) {
    if (starred === undefined) {
      starred = true;
    }
    this.isStarred = starred;
    console.log("Marking message " + this.subject + " " + this.msgID + " as starred");
    await this.folder.updateMessagesMetadata([ this ], { starred: starred } );
    return starred;
  }

  async deleteMessage(toTrash) {
    await this.folder.deleteMessages([ this ], toTrash);
  }

  async copy(targetFolder) {
    await this.folder.copyMessages([ this ], targetFolder);
  }

  async move(targetFolder) {
    await this.folder.moveMessages([ this ], targetFolder);
  }

  /**
   * @param attachmentID {string}
   */
  async getAttachment(attachmentID) {
    throw new ImplementThis();
  }

  /**
   * Add an attachment to a newly created message
   *
   * @param contentType {String}  The content type of the attachment
   * @param content {String}  The binary content of the attachment
   * @param size {Integer}  The length of content
   * @param name {String}  The name of the attachment
   * @param contentID {String}  For inline attachments, its content ID
  */
  async addAttachment(contentType, content, size, name, contentID) {
    throw new ImplementThis();
  }

  /**
   * Send the newly created message to its recipients.
   *
   * A copy will be stored in the |folder|.
   */
  async send() {
    throw new ImplementThis();
  }

  /**
   * Parse a MIME message.
   * @returns {EMail}
   */
  static fromMIME(fullMIME) {
    throw new ImplementThis();
  }
}
