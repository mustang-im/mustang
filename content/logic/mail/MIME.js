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
 * The Original Code is the Beonex Mail Notifier
 *
 * The Initial Developer of the Original Code is
 *  Ben Bucksch <ben.bucksch beonex.com>
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2017
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

var util = require("/util/util.js");
util.importAll(util, this);
var sanitize = require("/util/sanitizeDatatypes").sanitize;

/**
 * Parses an RFC822 message and gives
 * - Subject
 * - Author email address
 * - Author realname, if given
 * - Author (full From: line)
 * - First part of plaintext body (not yet implemented)
 *
 * @param fullText (optional) @see parse()
 */
function RFC822Mail(fullText)
{
  this.date = new Date();
  //ddebug("parsing email: " + fullText.join("\r\n"));
  if (fullText)
    this.parse(fullText);
}
RFC822Mail.prototype =
{
  // Title of the email, set by author
  subject : null,
  /**
   * Only the realname portion of From:
   * As set by author. If not given, this is the email address.
   */
  authorRealname : null,
  authorEmailAddress : null,
  /**
   * Complete From: header content
   */
  authorFull : null,

  contentType : null,

  /**
   * @param fullText {Array of String} One string per line.
   * RFC822-formatted message,
   * with header and optionally body.
   * Uses it to fill this object.
   */
  parse : function(fullText)
  {
    var body = false;
    fullText.forEach(function(line)
    {
      try {
        sanitize.string(line);
        if (!body) // header
        {
          if (!line)
          {
            body = true;
            return;
          }
          if (line[0] == " " || line[0] == "\t") // starts with whitespace
            return; // Not supporting folded lines, ignore 2. line
          var nameVal = line.split(": ", 2);
          if (nameVal.length != 2)
            throw new Exception("malformed RFC822 header: " + line);
          var name = sanitize.alphanumdash(nameVal[0]);
          this.parseHeader(name, sanitize.string(nameVal[1]));
        }
        else // body
        {
          // not implemented
        }
      } catch (e) { errorInBackend(e); }
    }, this);
  },
  /**
   * Parses a single RFC822 header and
   * uses it to fill this object.
   */
  parseHeader : function(name, content)
  {
    name = name.toLowerCase();
    content = decodeMIMEHeader(content);
    if (name == "subject")
    {
      this.subject = sanitize.label(content);
      //ddebug("got subject " + this.subject);
    }
    else if (name == "from")
    {
      this.authorFull = sanitize.label(content);
      try {
        var res = /(.*) <(.+)@([\w\.\-]+)>/.exec(content);
        if (res)
        {
          this.authorRealname = sanitize.label(res[1]);
          this.authorEmailAddress = sanitize.label(res[2]) + "@" +
              sanitize.hostname(res[3]);
        }
        else
        {
          var res = /(.+)@([\w\.\-]+) \((.*)\)/.exec(content);
          if (res)
          {
            this.authorRealname = sanitize.label(res[3]);
            this.authorEmailAddress = sanitize.label(res[1]) + "@" +
                sanitize.hostname(res[1]);
          }
        }
      } catch (e) {
        ddebug("Expected problem when parsing From: line: " + e);
      }
      if (!this.authorRealname)
        this.authorRealname = this.authorFull;
      if (!this.authorEmailAddress)
        this.authorEmailAddress = this.authorFull;
      this.authorRealname = removeQuotes(this.authorRealname, '"', '"');
      this.authorRealname = removeQuotes(this.authorRealname, "<", ">");
      this.authorEmailAddress = removeQuotes(this.authorEmailAddress, "<", ">");
    }
    else if (name == "content-type")
    {
      this.contentType = sanitize.label(content);
    }
    else if (name == "date")
    {
      // new Date() understands RFC822 date strings
      // <https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date>
      // It also understands ISO datetime strings and Unixtime integers
      try {
        // First try it as a Unixtime integer
        this.date = new Date(sanitize.integer(content));
      } catch (e) {
        this.date = new Date(sanitize.nonemptystring(content));
      }
    }
    else if (name == "message-id")
    {
      this.msgID = sanitize.nonemptystring(content);
    }
    // else ignore
  },
}

function removeQuotes(text, startQuote, endQuote)
{
  if (text[0] == startQuote && text[text.length - 1] == endQuote)
    return text.substr(1, text.length - 2);
  return text;
}

/**
 * This allows to decode MIME headers in non-ASCII character sets,
 * e.g. "=?iso-8859-1?q?This=20is=20some=20text?=".
 * @see RFC2047
 */
function decodeMIMEHeader(encoded)
{
  sanitize.label(encoded);
  return encoded.replace(/=\?.*?\?=/g, _decodeMIMEHeaderWord);
}

function _decodeMIMEHeaderWord(encoded)
{
  sanitize.label(encoded);
  if (encoded.substr(0, 2) != "=?") // not encoded
    return encoded;
  var parts = encoded.split("?");
  if (parts.length != 5 || parts[4] != "=") // malformed
  {
    ddebug("wrong number of ? in: " + encoded);
    return encoded;
  }
  var charset = sanitize.alphanumdash(parts[1]);
  var encoding = parts[2].toUpperCase();
  var encodedText = parts[3];
  var decodedText;
  if (encoding == "Q")
    decodedText = _decodeMIMEQCoding(encodedText);
  else if (encoding == "B")
    decodedText = atob(encodedText);
  else // error
  {
    ddebug("unknown coding: " + encoding);
    return encodedText;
  }

  return decodedText; // sufficient for Latin-1
  // convert from charset to unicode
  /* TODO PORT
  var unicodeStr = utf8converterservice.convertStringToUTF8(
      decodedText, charset, true);
  return unicodeStr;*/
}

function _decodeMIMEQCoding(encodedText)
{
  return replaceAll(encodedText, "_", " ")
      .replace(/\=[0-9a-fA-F]{2}/g, function(match)
  {
    // TODO does that work for non-Latin-1 (which matches Unicode)? Test with Japanese charsets.
    return String.fromCharCode(parseInt(match.substr(1, 2), 16));
  });
}

/*
ddebug("testcases");
var org = "=?ISO-8859-1?q?Yahoo!_=E4ndert?= <foo> =?ISO-8859-1?q?Yahoo!_=E4ndert?= <foo>";
ddebug(org + " -> " + decodeMIMEHeader(org));
org = "=?ISO-8859-1?q?Yahoo!_=E4ndert_Gesch=E4ftsbedingungen?=";
ddebug(org + " -> " + decodeMIMEHeader(org));
*/

exports.RFC822Mail = RFC822Mail;
exports.decodeMIMEHeader = decodeMIMEHeader;
