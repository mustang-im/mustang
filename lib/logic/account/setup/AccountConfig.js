import { sanitize } from "../../../util/sanitizeDatatypes";
import { deepCopy } from "../../../util/util";

/**
 * This file creates the class AccountConfig, which is a JS object that holds
 * a configuration for a certain account. It is *not* created in the backend
 * yet (use aw-createAccount.js for that), and it may be incomplete.
 *
 * Several AccountConfig objects may co-exist, e.g. for autoconfig.
 * One AccountConfig object is used to prefill and read the widgets
 * in the Wizard UI.
 * When we autoconfigure, we autoconfig writes the values into a
 * new object and returns that, and the caller can copy these
 * values into the object used by the UI.
 *
 * See also
 * <https://wiki.mozilla.org/Thunderbird:Autoconfiguration:ConfigFileFormat>
 * for values stored.
 *
 * (c) Ben Bucksch 2011-2021
 */

export default class AccountConfig {
  constructor() {
    /**
     * Real name of user,
     * as shown in From: of outgoing mails
     */
    this.realName = "%REALNAME%";
    /**
     * Email address for which this config is.
     * Will also be shown as From: in outgoing mails.
     */
    this.emailAddress = "%EMAILADDRESS%";
    /**
     * The password for the incoming server
     * and (if necessary) the outgoing server.
     */
    this.password = "";

    this.incoming = this.createNewIncoming();
    this.outgoing = this.createNewOutgoing();
    /**
     * Other servers which can be used instead of |incoming|,
     * in order of decreasing preference.
     * (|incoming| itself should not be included here.)
     * { Array of incoming/createNewIncoming() }
     */
    this.incomingAlternatives = [];
    this.outgoingAlternatives = [];
    /**
     * { Array of { varname (value without %), displayName, exampleValue } }
     */
    this.inputFields = [];
    /**
     * email address domains for which this config is applicable
     * { Array of Strings }
     */
    this.domains = [];
    /**
     * Just an internal string to refer to this config. Do not show to user.
     * {string}
     */
    this.id = "";
    /**
     * what created the config.
     * { one of kSource* }
     */
    this.source = "unknown";
    this.displayName = null;
  }

  /**
   * Factory function for incoming and incomingAlternatives
   */
  createNewIncoming() {
    return {
      // { String-enum: "pop3", "imap", "nntp", "exchange" }
      type: null,
      hostname: null,
      // { Integer }
      port: null,
      // May be a placeholder (starts and ends with %). { String }
      username: null,
      password: null,

      /**
       * How to log in to the server: plaintext or encrypted pw, GSSAPI etc.
       *
       * { string enum }
       * "unknown" -- config invalid
       * "none" = no login necessary
       * "passwordCleartext" = cleartext password, possibly via SSL
       * "passwordEncrypted" = CRAM-MD5, DIGEST etc.
       * "GSSAPI" = Kerberos or ActiveDirectory
       * "NTLM" = Windows NTLM
       * "ssl-cert" = Use SSL client cert, AUTH EXTERNAL
       * "oauth2" = OAuth2
       * "web" = Web page login (not OAuth2)
       */
      auth: "unknown",
      /**
       * Other auth methods that we think the server supports.
       * They are ordered by descreasing preference.
       * (|auth| itself is not included in |authAlternatives|)
       * {Array of Ci.nsMsgAuthMethod} (same as .auth)
       */
      authAlternatives: null,

      /**
       * "unknown" = invalid config
       * "plain" = no SSL
       * "tls" = normal TLS, no STARTTLS
       * "starttls" = STARTTLS, i.e. start unencrypted, then upgrade to SSL
       *   This will insist on STARTTTLS.
       *   'TLS when available' is insecure and not supported here.
       * { string enum }
       */
      socketType: "unknown",
      /**
       * true when the cert is invalid (and thus SSL useless), because it's
       * 1) not from an accepted CA (including self-signed certs)
       * 2) for a different hostname or
       * 3) expired.
       * May go back to false when user explicitly accepted the cert.
       */
      badCert: false,

      // in minutes { Integer }
      checkInterval: 10,
      loginAtStartup: true,
      // POP3 only:
      // Not yet implemented. { Boolean }
      useGlobalInbox: false,
      leaveMessagesOnServer: true,
      daysToLeaveMessagesOnServer: 14,
      deleteByAgeFromServer: true,
      // When user hits delete, delete from local store and from server
      deleteOnServerWhenLocalDelete: true,
      downloadOnBiff: true,
      // Override `addThisServer` for a specific incoming server
      useGlobalPreferredServer: false,

      // OAuth2 configuration, if needed.
      oauthSettings: null,

      // for Microsoft Exchange servers. Optional.
      owaURL: null,
      ewsURL: null,
      easURL: null,
      // for when an addon overrides the account type. Optional.
      subType: null,
    };
  }
  /**
   * Factory function for outgoing and outgoingAlternatives
   */
  createNewOutgoing() {
    return {
      type: "smtp",
      hostname: null,
      port: null, // see incoming
      username: null, // see incoming. may be null, if auth is 0.
      password: null, // see incoming. may be null, if auth is 0.
      socketType: "unknown", // see incoming
      badCert: false, // see incoming
      auth: "unknown", // see incoming
      authAlternatives: null, // see incoming
      addThisServer: true, // if we already have an SMTP server, add this
      // if we already have an SMTP server, use it.
      useGlobalPreferredServer: false,
      // we should reuse an already configured SMTP server.
      // nsISmtpServer.key
      existingServerKey: null,
      // user display value for existingServerKey
      existingServerLabel: null,

      // OAuth2 configuration, if needed.
      oauthSettings: null,
    };
  }

  /**
   * Returns a deep copy of this object,
   * i.e. modifying the copy will not affect the original object.
   */
  copy() {
    // Workaround: deepCopy() fails to preserve base obj (instanceof)
    let result = new AccountConfig();
    for (let prop in this) {
      result[prop] = deepCopy(this[prop]);
    }

    return result;
  }

  isComplete() {
    return (
      !!this.incoming.type &&
      !!this.incoming.hostname &&
      !!this.incoming.port &&
      !!this.incoming.socketType &&
      !!this.incoming.auth &&
      !!this.incoming.username &&
      (!!this.outgoing.existingServerKey ||
        this.outgoing.useGlobalPreferredServer ||
        (!!this.outgoing.hostname &&
          !!this.outgoing.port &&
          !!this.outgoing.socketType &&
          !!this.outgoing.auth &&
          !!this.outgoing.username))
    );
  }

  /**
   * Some fields on the account config accept placeholders (when coming from XML).
   *
   * These are the predefined ones
   * * %EMAILADDRESS% (full email address of the user, usually entered by user)
   * * %EMAILLOCALPART% (email address, part before @)
   * * %EMAILDOMAIN% (email address, part after @)
   * * %REALNAME%
   * as well as those defined in account.inputFields.*.varname, with % added
   * before and after.
   *
   * These must replaced with real values, supplied by the user or app,
   * before the account is created. This is done here. You call this function once
   * you have all the data - gathered the standard vars mentioned above as well as
   * all listed in account.inputFields, and pass them in here. This function will
   * insert them in the fields, returning a fully filled-out account ready to be
   * created.
   *
   * @param c {AccountConfig}
   * The account data to be modified. It may or may not contain placeholders.
   * After this function, it should not contain placeholders anymore.
   * This object will be modified in-place.
   *
   * @param realName {String}
   * Real name of user, as will appear in From of outgoing messages
   *
   * @param emailAddress {String}
   * Full email address of this account, e.g. "joe@example.com".
   * Empty of incomplete email addresses will/may be rejected.
   *
   * @param password {String}
   * The password for the incoming server and (if necessary) the outgoing server
   */
  replaceVariables(realName, emailAddress, password) {
    realName = realName || this.realName;
    emailAddress = emailAddress || this.emailAddress;
    password = password || this.password;
    sanitize.label(realName);
    sanitize.nonemptystring(realName);
    sanitize.nonemptystring(emailAddress);

    let emailSplit = emailAddress.split("@");
    assert(
      emailSplit.length == 2,
      "email address not in expected format: must contain exactly one @"
    );
    let emailLocal = sanitize.nonemptystring(emailSplit[0]);
    let emailDomain = sanitize.hostname(emailSplit[1]);

    let otherVars = {};
    otherVars.EMAILADDRESS = emailAddress;
    otherVars.EMAILLOCALPART = emailLocal;
    otherVars.EMAILDOMAIN = emailDomain;
    otherVars.REALNAME = realName;

    if (password) {
      this.incoming.password = password;
      this.outgoing.password = password; // set member only if auth required?
    }
    this.incoming.username = _replaceVariable(this.incoming.username, otherVars);
    this.outgoing.username = _replaceVariable(this.outgoing.username, otherVars);
    this.incoming.hostname = _replaceVariable(this.incoming.hostname, otherVars);
    if (this.outgoing.hostname) { // will be null, if user picked an existing server
      this.outgoing.hostname = _replaceVariable(this.outgoing.hostname, otherVars);
    }
    this.realName = _replaceVariable(this.realName, otherVars);
    this.emailAddress = _replaceVariable(this.emailAddress, otherVars);
    this.displayName = _replaceVariable(this.displayName, otherVars);
  }
};

// enum consts

// .source
AccountConfig.kSourceUser = "user"; // user manually entered the config
AccountConfig.kSourceXML = "xml"; // config from XML from ISP or Mozilla DB
AccountConfig.kSourceGuess = "guess"; // guessConfig()
AccountConfig.kSourceExchange = "exchange"; // from Microsoft Exchange AutoDiscover

function _replaceVariable(variable, values) {
  let str = variable;
  if (typeof str != "string") {
    return str;
  }

  for (let varname in values) {
    str = str.replace("%" + varname + "%", values[varname]);
  }

  return str;
}
