import MsgFolder from "../account/MsgFolder";
import parseMIME from "emailjs-mime-parser";
import htmlToText from "html-to-text";

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


    // content

    /**
     * Raw RFC2822 MIME message,
     * with full headers and all body parts.
     * {string}
     */
    this._mime = null;

    /**
     * {MimeNode} <https://github.com/emailjs/emailjs-mime-parser>
     */
    this._bodyParts = null;


    // mutable meta data

    this.isRead = false;

    this.isStarred = false;
  }

  async MIME() {
    return this._mime;
  }

  async bodyParts() {
    if (this._bodyParts) {
      return this._bodyParts;
    }

    // Parse raw MIME into body structure
    // using <https://github.com/emailjs/emailjs-mime-parser>
    this._bodyParts = parseMIME(await this.MIME());

    // Decode Uint8Array
    this._walkTree(this._bodyParts, part => {
      if (part.content) {
        let charset = part.contentType &&
            part.contentType.params &&
            part.contentType.params.charset &&
            part.contentType.params.charset.toLowerCase() ||
            "utf-8";
        part.content = convertUint8ArrayToString(part.content, charset);
      }
    });

    return this._bodyParts;
  }

  /**
   * Walks the body part tree hierarchy.
   * Calls |func| on each |childNodes| and self.
   * @param func {Function(part)}
   */
  _walkTree(part, func) {
    func(part);
    if (part.childNodes) {
      for (let child of part.childNodes) {
        this._walkTree(child, func);
      }
    }
  }

  async bodyPlaintext() {
    let text = null;
    function process(part) {
      if (text) {
        return;
      }
      //console.log("Content-Type: " + part.contentType.value);
      if (part.contentType.value == "multipart/alternative") {
        // last is the most preferred
        let ordered = arrayReverse(part.childNodes);
        // but we want plaintext
        let plaintextPart = ordered.find(part => part.contentType.value == "text/plain");
        if (plaintextPart) {
          process(plaintextPart);
          return;
        }
        let htmlPart = ordered.find(part => part.contentType.value == "text/html");
        if (htmlPart) {
          process(htmlPart);
          return;
        }
        process(ordered.childNodes[0]);
      } else if (part.contentType.value == "text/plain") {
        text = part.content;
      } else if (part.contentType.value == "text/html") {
        text = convertHTMLtoPlaintext(part.content);
      }
    }
    this._walkTree(await this.bodyParts(), process);
    return text;
  }

  /**
   * Wheather the message has been read or not
   * @param read {Boolean}
   *   true: mark as read
   *   false: mark as unread
   *   not passed (undefined): mark as read
   */
  async markAsRead(read) {
    throw new ImplementThis();
  }

  /**
   * Wheather the message has been marked as flagged or not
   * @param starred {Boolean}
   *   true: flagged
   *   false: not flagged
   *   not passed (undefined): flagged
   */
  async star(starred) {
    throw new ImplementThis();
  }

  async deleteMessage(toTrash) {
    throw new ImplementThis();
  }

  async copy(targetFolder) {
    throw new ImplementThis();
  }

  async move(targetFolder) {
    throw new ImplementThis();
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
    let msg = new EMail();
    msg._mime = fullMIME;
    // TODO parse headers
    return msg;
  }
}




////////////////////////
// Helper functions

function convertHTMLtoPlaintext(plaintext) {
  return htmlToText.fromString(plaintext, {
    ignoreImage: true,
  });
}

function arrayReverse(array) {
  let result = [];
  for (let m of array) {
    result.unshift(m);
  }
  return result;
}

// TODO charsets other than UTF-8
function convertUint8ArrayToString(uint8Array, charset) {
  //return String.fromCharCode.apply(null, uint8Array);
  //return uint8Array.toString(charset);
  return Utf8ArrayToString(uint8Array);
}

/* utf.js - UTF-8 <=> UTF-16 convertion
 * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */
function Utf8ArrayToString(array) {
    var out = "";
    var len = array.length;
    for (let i = 0; i < len; ) {
      let c = array[i++];
      let char2, char3;
      switch (c >> 4) {
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
          // 0xxxxxxx
          out += String.fromCharCode(c);
          break;
        case 12: case 13:
          // 110x xxxx   10xx xxxx
          char2 = array[i++];
          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
          break;
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++];
          char3 = array[i++];
          out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
          break;
      }
    }
    return out;
}
