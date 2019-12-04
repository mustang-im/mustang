/**
 * An RFC822 message with
 * - Subject
 * - Author email address
 * - Author realname, if given
 * - Author (full From: line)
 * - First part of plaintext body
 * - Message ID
 *
 * @param fullText (optional) @see parse()
 */
export default class EMail {
  constructor(fullText) {
    this.date = new Date();

    // Message-ID header
    this.msgID = null;

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

    this.body = null;


    // mutable meta data

    this.isRead = false;
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
    //throw new ImplementThis();
    return read;
  }
}
