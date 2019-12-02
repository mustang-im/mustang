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
export default class RFC822Mail {
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
  }
}
