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
 * The Original Code is the Beonex Mail Notifier and Mozilla Thunderbird
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

/**
 * This file contains the mechanics of account object creation,
 * which gets the account class of an appropriate type.
 */


var util = require("util/util");
util.importAll(util, global);
var accounts = require("logic/account/account-list"); // add, remove, getExisting
var Account = require("logic/account/account-base").Account;
var IMAPAccount = require("logic/mail/imap").IMAPAccount;
var POP3Account = require("logic/mail/pop3").POP3Account;
var FetchHTTP = require("util/fetchhttp").FetchHTTP;
var JXON = require("logic/account/JXON");
var sanitize = require("util/sanitizeDatatypes").sanitize;
var gStringBundle = new (require("trex/stringbundle")).StringBundle("mail");
var mozillaISPDBURL = "https://autoconfig.thunderbird.net/v1.1/";

/**
 * Create a new |Account| object for |emailAddress|.
 *
 * Note: You need to call account.saveToPrefs() yourself.
 *
 * @param successCallback {Function(account {Account})}
 *     Called, if the email address is supported and could be configured.
 * @param errorCallback {Function(msg {String or Exception})}
 *     Called, if we cannot configure that email address.
 * @returns {Abortable}
 */
function makeNewAccount(emailAddress, successCallback, errorCallback) {
  try {
    sanitize.nonemptystring(emailAddress);
    assert(emailAddress == emailAddress.toLowerCase(),
            "email addresses must be lowercase");
    assert( !accounts.getExistingAccountForEmailAddress(emailAddress),
            "account already exists");
    //var accountID = emailAddress;
    var accountID = generateNewAccountID();
    var domain = Account.getDomainForEmailAddress(emailAddress);
  } catch (e) { errorCallback(e); }

  return getAccountProviderWithNet(domain, emailAddress, function(config)
  {
    var account = _newAccountOfType(config.subtype || config.type, accountID, true);
    account.emailAddress = emailAddress;
    account.setServerConfig(config);

    accounts.getAllAccounts().set(accountID,  account);
    successCallback(account);
    notifyGlobalObservers("account-added", { account : account });
  }, errorCallback);
}

function generateNewAccountID() {
  var existingAccountIDs = ourPref.get("accountsList", "").split(",");
  var newAccountID;
  var i = 1;
  do {
    newAccountID = "account" + i++;
  } while (existingAccountIDs.indexOf(newAccountID) != -1 &&
      ourPref.get("account." + newAccountID + ".type", null))
  return newAccountID;
}

function _newAccountOfType(type, accountID, isNew)
{
  if (type == "imap")
    return new IMAPAccount(accountID, isNew);
  else if (type == "pop3")
    return new POP3Account(accountID, isNew);
  else
    throw new NotReached("unknown account type requested to be created: " + type);
}

/**
 * Checks whether the domain of the email address is supported by us.
 *
 * @param emailAddress {String}
 * @param successCallback {Function(config {Object})} check passed
 * @param errorCallback check failed, with reason
 * @returns {Abortable}
 */
function verifyEmailAddressDomain(emailAddress, successCallback, errorCallback)
{
  var domain = Account.getDomainForEmailAddress(emailAddress);
  return getAccountProviderWithNet(domain, emailAddress,
      successCallback, errorCallback);
}




/********************************************************************
 * Find config for an email address
 ********************************************************************/

// TODO move to TB account creation wizard

/**
 * To avoid unnecessarily repeating network requests,
 * e.g. when verifying email address again.
 *
 * map domain {String} -> {config object}
 */
var gCachedConfigs = {};

/**
 * Finds the provider that hosts this email address.
 * Uses MX lookups over the network to determine the provider.
 *
 * @see Disclaimers at fetchConfigForMX()
 * <http://mxr.mozilla.org/comm-central/source/
 * mailnews/base/prefs/content/accountcreation/fetchConfig.js#136>
 *
 * @param domain {String} email address, part after @
 * @param successCallback {Function(config {Object})}
 *     Called, if the provider could be found and is supported.
 * @param errorCallback {Function(msg {String or Exception})}
 *     Called, if we cannot configure that email address.
 * @returns {Abortable}
 */
function getAccountProviderWithNet(domain, emailAddress,
                                   inSuccessCallback, errorCallback)
{
  var successCallback = function(config) {
    gCachedConfigs[domain] = config;
    inSuccessCallback(config);
  };

  if (domain in gCachedConfigs) {
    successCallback(gCachedConfigs[domain]);
    return new Abortable();
  }

  var config;
  var errorMsg = gStringBundle.get("error.domain");

  // Now fetch the MX record for the domain and check whether
  // the SLD of it matches one of our known domains.
  // Given that Mozilla can't do DNS MX lookups,
  // we use the webservice that Thunderbird uses.
  // @see fetchConfigForMX()
  // <http://mxr.mozilla.org/comm-central/source/
  // mailnews/base/prefs/content/accountcreation/fetchConfig.js#136>
  var sab = new SuccessiveAbortable();
  sab.current = getMX(domain, function(mxHostnames) {
    var providerDomains = [];
    for (var i = 0; i < mxHostnames.length; i++) {
      try {
        providerDomains.push(getBaseDomainFromHost(mxHostnames[i]));
      } catch (e) {
        // Some domains (e.g. ar.com, foo.com) return IP address,
        // which causes getBaseDomainFromHost() to throw.
        // Error handled below by providerDomains.length == 0.
      }
    }
    if (providerDomains.length == 0) {
      errorCallback(new InvalidDomainError(errorMsg));
    }
    var providerDomain = providerDomains[0];

    // At this point, it's definitely not one of our accounts.
    // Try to query the Mozilla ISP database and see whether we can find
    // IMAP server information there.

    // First, try the domain directly, then via MX domain
    sab.current = fetchConfigFromMozillaDB(domain, function(ac) {
      ddebug("found config for " + domain);
      successCallback(convertMozillaConfigToOurs(ac, emailAddress));
    }, function(e) {
      errorInBackend(e);
      sab.current = fetchConfigFromMozillaDB(providerDomain, function(ac) {
        ddebug("found config for " + providerDomain);
        successCallback(convertMozillaConfigToOurs(ac, emailAddress));
      }, function(e) { errorCallback(new InvalidDomainError(errorMsg)); });
    });
  }, function(e) {
    errorCallback(e == "no MX found" || e.code == 404 ? new InvalidDomainError(errorMsg) : e);
  });
  return sab;
}

/**
 * @param ac {AccountConfig}
 * @returns {Object} provider config
 */
function convertMozillaConfigToOurs(ac, emailAddress) {
  replaceVariables(ac, emailAddress);
  return ac.incoming; // all the properties match, luckily
}

/**
 * Returns the base domain of hostname.
 * E.g. for "www2.static.amazon.com" returns "amazon.com"
 * and for "www2.static.amazon.co.uk" returns "amazon.co.uk"
 *
 * Like EffectiveTLD.getBaseDomainFromHost() on Firefox.
 * Since GChrome has no native support for this, we have to
 * guess at it.
 */
function getBaseDomainFromHost(aHostname) {
  var domainparts = aHostname.split(".");
  if (domainparts[domainparts.length - 1] == "uk") {
    // HACK Handle .co.uk
    return domainparts.slice(domainparts.length - 3).join(".");
  } else {
    return domainparts.slice(domainparts.length - 2).join(".");
  }
}

/**
 * <copied from="mailnews/base/prefs/content/accountcreation/fetchConfig.js"
 * license="MPL" />
 *
 * Queries the DNS MX for the domain
 *
 * The current implementation goes to a web service to do the
 * DNS resolve for us, because Mozilla unfortunately has no implementation
 * to do it. That's just a workaround. Once bug 545866 is fixed, we make
 * the DNS query directly on the client. The API of this function should not
 * change then.
 *
 * Returns (in successCallback) the hostnames of the MX servers.
 *
 * @param domain {String}
 * @param successCallback {function(hostnames {Array of {String}})
 *   Called when we found an MX for the domain.
 *   For |hostnames|, see description above.
 * @param errorCallback
 * @returns {Abortable}
 */
function getMX(domain, successCallback, errorCallback)
{
  // TODO rewrite using var dns = require("dns");
  domain = sanitize.hostname(domain);
  var url = "https://mx.thunderbird.net/" + domain;
  var fetch = new FetchHTTP({ url : url }, function(result)
  {
    // result is plain text, with one line per server.
    ddebug("MX query result: \n" + result + "(end)");
    assert(typeof(result) == "string");
    var results = result.split("\n");
    var hostnames = [];
    results.forEach(function(result) {
      if (result.toLowerCase().replace(/[^a-z0-9\-_\.]*/g, "").length == 0) {
        return;
      }
      hostnames.push(result);
    }, this);
    if (hostnames.length == 0)
    {
      errorCallback("no MX found");
      return;
    }
    successCallback(hostnames);
  }, errorCallback);
  fetch.start();
  return fetch;
}


/**
 * <copied from="mailnews/base/prefs/content/accountcreation/fetchConfig.js"
 * license="MPL" />
 *
 * Tries to get a configuration for this ISP from a central database at
 * Mozilla servers.
 *
 * @param domain {String}   The domain part of the user's email address
 * @param successCallback {Function(config {AccountConfig}})}   A callback that
 *         will be called when we could retrieve a configuration.
 *         The AccountConfig object will be passed in as first parameter.
 * @param errorCallback {Function(ex)}   A callback that
 *         will be called when we could not retrieve a configuration,
 *         for whatever reason. This is expected (e.g. when there's no config
 *         for this domain at this location),
 *         so do not unconditionally show this to the user.
 *         The first paramter will be an exception object or error string.
 */
function fetchConfigFromMozillaDB(domain, successCallback, errorCallback)
{
  var url = mozillaISPDBURL + domain;
  domain = sanitize.hostname(domain);

  if (!url.length)
    return errorCallback("no fetch url set");
  var fetch = new FetchHTTP({ url: url }, function(result) {
    successCallback(readFromXML(JXON.build(result)));
  }, errorCallback);
  fetch.start();
  return fetch;
}

/**
 * <copied from="mailnews/base/prefs/content/accountcreation/readFromXML.js"
 * license="MPL" />
 *
 * Takes an XML snippet (as JXON) and reads the values into
 * a new AccountConfig object.
 * It does so securely (or tries to), by trying to avoid remote execution
 * and similar holes which can appear when reading too naively.
 * Of course it cannot tell whether the actual values are correct,
 * e.g. it can't tell whether the host name is a good server.
 *
 * The XML format is documented at
 * <https://wiki.mozilla.org/Thunderbird:Autoconfiguration:ConfigFileFormat>
 *
 * @param clientConfigXML {JXON}  The <clientConfig> node.
 * @return AccountConfig   object filled with the data from XML
 */
function readFromXML(clientConfigXML)
{
  function array_or_undef(value) {
    return value === undefined ? [] : value;
  }
  var i, j; // Predeclare loop counters
  var exception;
  if (typeof(clientConfigXML) != "object" ||
      !("clientConfig" in clientConfigXML) ||
      !("emailProvider" in clientConfigXML.clientConfig))
  {
    ddebug("client config xml = " + JSON.stringify(clientConfigXML));
    var stringBundle = new StringBundle("email/accountCreationModel");
    throw stringBundle.get("no_emailProvider.error");
  }
  var xml = clientConfigXML.clientConfig.emailProvider;

  var d = new AccountConfig();
  d.source = AccountConfig.kSourceXML;

  d.id = sanitize.hostname(xml["@id"]);
  d.displayName = d.id;
  try {
    d.displayName = sanitize.label(xml.displayName);
  } catch (e) { errorInBackend(e); }
  xml.$domain.forEach(function(domain)
  {
    try {
      d.domains.push(sanitize.hostname(domain));
    } catch (e) { errorInBackend(e); exception = e; }
  }, this);
  if (d.domains.length == 0)
    throw exception ? exception : "need proper <domain> in XML";
  exception = null;

  // incoming server
  var incomingServer = array_or_undef(xml.$incomingServer); // input (XML)
  for (i=0; i < incomingServer.length; i++)
  {
    var iX = incomingServer[i];
    var iO = d.createNewIncoming(); // output (object)
    try {
      // throws if not supported
      iO.type = sanitize.enum(iX["@type"], ["pop3", "imap", "nntp"]);
      iO.hostname = sanitize.hostname(iX.hostname);
      iO.port = sanitize.integerRange(iX.port, 1, 65535);
      // We need a username even for Kerberos, need it even internally.
      iO.username = sanitize.string(iX.username); // may be a %VARIABLE%

      if ("password" in iX) {
        d.rememberPassword = true;
        iO.password = sanitize.string(iX.password);
      }

      var socketType = array_or_undef(iX.$socketType);
      for (j=0; j < socketType.length; j++)
      {
        var iXsocketType = socketType[j];
        try {
          iO.socketType = sanitize.translate(iXsocketType,
              { plain : 1, SSL: 2, STARTTLS: 3 });
          break; // take first that we support
        } catch (e) { exception = e; }
      }
      if (!iO.socketType)
        throw exception ? exception : "need proper <socketType> in XML";
      exception = null;

      var authentication = array_or_undef(iX.$authentication);
      for (j=0; j < authentication.length; j++)
      {
        var iXauth = authentication[j];
        try {
          iO.auth = sanitize.translate(iXauth,
              { "password-cleartext" : "password-cleartext",
                "plain" : "password-cleartext",
                "password-encrypted" : "password-encrypted",
                "secure" : "password-encrypted",
                "GSSAPI" : "GSSAPI",
                "NTLM" : "NTLM",
              });
          break; // take first that we support
        } catch (e) { exception = e; }
      }
      if (!iO.auth)
        throw exception ? exception : "need proper <authentication> in XML";
      exception = null;

      // defaults are in accountConfig.js
      if (iO.type == "pop3" && "pop3" in iX)
      {
        try {
          if ("leaveMessagesOnServer" in iX.pop3)
            iO.leaveMessagesOnServer =
                sanitize.boolean(iX.pop3.leaveMessagesOnServer);
          if ("daysToLeaveMessagesOnServer" in iX.pop3)
            iO.daysToLeaveMessagesOnServer =
                sanitize.integer(iX.pop3.daysToLeaveMessagesOnServer);
        } catch (e) { errorInBackend(e); }
        try {
          if ("downloadOnBiff" in iX.pop3)
            iO.downloadOnBiff = sanitize.boolean(iX.pop3.downloadOnBiff);
        } catch (e) { errorInBackend(e); }
      }

      // processed successfully, now add to result object
      if (!d.incoming.hostname) // first valid
        d.incoming = iO;
      else
        d.incomingAlternatives.push(iO);
    } catch (e) { exception = e; }
  }
  if (!d.incoming.hostname)
    // throw exception for last server
    throw exception ? exception : "Need proper <incomingServer> in XML file";
  exception = null;

  // outgoing server
  var outgoingServer = array_or_undef(xml.$outgoingServer); // input (XML)
  for (i=0; i < outgoingServer.length; i++)
  {
    var oX = outgoingServer[i];
    var oO = d.createNewOutgoing(); // output (object)
    try {
      if (oX["@type"] != "smtp")
      {
        var stringBundle = new StringBundle("email/accountCreationModel");
        throw stringBundle.get("outgoing_not_smtp.error");
      }
      oO.hostname = sanitize.hostname(oX.hostname);
      oO.port = sanitize.integerRange(oX.port, 1, 65535);

      var socketType = array_or_undef(oX.$socketType);
      for (j=0; j < socketType.length; j++)
      {
        var oXsocketType = socketType[j];
        try {
          oO.socketType = sanitize.translate(oXsocketType,
              { plain : 1, SSL: 2, STARTTLS: 3 });
          break; // take first that we support
        } catch (e) { exception = e; }
      }
      if (!oO.socketType)
        throw exception ? exception : "need proper <socketType> in XML";
      exception = null;

      var authentication = array_or_undef(oX.$authentication);
      for (j=0; j < authentication.length; j++)
      {
        var oXauth = authentication[j];
        try {
          oO.auth = sanitize.translate(oXauth,
              {
                // open relay
                "none" : "none",
                // inside ISP or corp network
                "client-IP-address" : "client-IP-address",
                // hope for the best
                "smtp-after-pop" : "smtp-after-pop",
                "password-cleartext" : "password-cleartext",
                "plain" : "password-cleartext",
                "password-encrypted" : "password-encrypted",
                "secure" : "password-encrypted",
                "GSSAPI" : "GSSAPI",
                "NTLM" : "NTLM",
              });
          break; // take first that we support
        } catch (e) { exception = e; }
      }
      if (!oO.auth)
        throw exception ? exception : "need proper <authentication> in XML";
      exception = null;

      if ("username" in oX ||
          // if password-based auth, we need a username,
          // so go there anyways and throw.
          oO.auth == "password-cleartext" ||
          oO.auth == "password-encrypted")
        oO.username = sanitize.string(oX.username);

      if ("password" in oX) {
        d.rememberPassword = true;
        oO.password = sanitize.string(oX.password);
      }

      try {
        // defaults are in accountConfig.js
        if ("addThisServer" in oX)
          oO.addThisServer = sanitize.boolean(oX.addThisServer);
        if ("useGlobalPreferredServer" in oX)
          oO.useGlobalPreferredServer =
              sanitize.boolean(oX.useGlobalPreferredServer);
      } catch (e) { errorInBackend(e); }

      // processed successfully, now add to result object
      if (!d.outgoing.hostname) // first valid
        d.outgoing = oO;
      else
        d.outgoingAlternatives.push(oO);
    } catch (e) { errorInBackend(e); exception = e; }
  }
  if (!d.outgoing.hostname)
    // throw exception for last server
    throw exception ? exception : "Need proper <outgoingServer> in XML file";
  exception = null;

  d.inputFields = new Array();
  array_or_undef(xml.$inputField).forEach(function(inputField)
  {
    try {
      var fieldset =
      {
        varname : sanitize.alphanumdash(inputField["@key"]).toUpperCase(),
        displayName : sanitize.label(inputField["@label"]),
        exampleValue : sanitize.label(inputField.value)
      };
      d.inputFields.push(fieldset);
    } catch (e) { errorInBackend(e); } // for now, don't throw,
        // because we don't support custom fields yet anyways.
  }, this);

  return d;
}

/**
 * <copied from="mailnews/base/prefs/content/accountcreation/accountConfig.js"
 * license="MPL" />
 *
 * This creates the class AccountConfig, which is a JS object that holds
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
 */
function AccountConfig()
{
  this.incoming = this.createNewIncoming();
  this.incomingAlternatives = [];
  this.outgoing = this.createNewOutgoing();
  this.outgoingAlternatives = [];
  this.identity =
  {
    // displayed real name of user
    realname : "%REALNAME%",
    // email address of user, as shown in From of outgoing mails
    emailAddress : "%EMAILADDRESS%",
  };
  this.inputFields = [];
  this.domains = [];
};
AccountConfig.prototype =
{
  // @see createNewIncoming()
  incoming : null,
  // @see createNewOutgoing()
  outgoing : null,
  /**
   * Other servers which can be used instead of |incoming|,
   * in order of decreasing preference.
   * (|incoming| itself should not be included here.)
   * { Array of incoming/createNewIncoming() }
   */
  incomingAlternatives : null,
  outgoingAlternatives : null,
  // just an internal string to refer to this. Do not show to user.
  id : null,
  // who created the config.
  // { one of kSource* }
  source : 0,
  displayName : null,
  // { Array of { varname (value without %), displayName, exampleValue } }
  inputFields : null,
  // email address domains for which this config is applicable
  // { Array of Strings }
  domains : null,

  /**
   * Factory function for incoming and incomingAlternatives
   */
  createNewIncoming : function()
  {
    return {
      // { String-enum: "pop3", "imap", "nntp" }
      type : null,
      hostname : null,
      // { Integer }
      port : null,
      // May be a placeholder (starts and ends with %). { String }
      username : null,
      password : null,
      // { enum: 1 = plain, 2 = SSL/TLS, 3 = STARTTLS always, 0 = not inited }
      // ('TLS when available' is insecure and not supported here)
      socketType : 0,
      /**
       * true when the cert is invalid (and thus SSL useless), because it's
       * 1) not from an accepted CA (including self-signed certs)
       * 2) for a different hostname or
       * 3) expired.
       * May go back to false when user explicitly accepted the cert.
       */
      badCert : false,
      /**
       * How to log in to the server: plaintext or encrypted pw, GSSAPI etc.
       * Same as server pref "authMethod".
       */
      auth : 0,
      /**
       * Other auth methods that we think the server supports.
       * They are ordered by descreasing preference.
       * (|auth| itself is not included in |authAlternatives|)
       * {Array of Strings} (same as .auth)
       */
      authAlternatives : null,
      // in minutes { Integer }
      checkInterval : 10,
      loginAtStartup : true,
      // POP3 only:
      // Not yet implemented. { Boolean }
      useGlobalInbox : false,
      leaveMessagesOnServer : true,
      daysToLeaveMessagesOnServer : 14,
      deleteByAgeFromServer : true,
      // When user hits delete, delete from local store and from server
      deleteOnServerWhenLocalDelete : true,
      downloadOnBiff : true,
    };
  },
  /**
   * Factory function for outgoing and outgoingAlternatives
   */
  createNewOutgoing : function()
  {
    return {
      type : "smtp",
      hostname : null,
      port : null, // see incoming
      username : null, // see incoming. may be null, if auth is 0.
      password : null, // see incoming. may be null, if auth is 0.
      socketType : 0, // see incoming
      badCert : false, // see incoming
      auth : 0, // see incoming
      authAlternatives : null, // see incoming
      addThisServer : true, // if we already have an SMTP server, add this
      // if we already have an SMTP server, use it.
      useGlobalPreferredServer : false,
      // we should reuse an already configured SMTP server.
      // nsISmtpServer.key
      existingServerKey : null,
      // user display value for existingServerKey
      existingServerLabel : null,
    };
  },

  /**
   * Returns a deep copy of this object,
   * i.e. modifying the copy will not affect the original object.
   */
  copy : function()
  {
    // Workaround: deepCopy() fails to preserve base obj (instanceof)
    var result = new AccountConfig();
    for (var prop in this)
      result[prop] = deepCopy(this[prop]);

    return result;
  },
  isComplete : function()
  {
    return (!!this.incoming.hostname && !!this.incoming.port &&
         !!this.incoming.socketType && !!this.incoming.auth &&
         !!this.incoming.username &&
         (!!this.outgoing.existingServerKey ||
          (!!this.outgoing.hostname && !!this.outgoing.port &&
           !!this.outgoing.socketType && !!this.outgoing.auth &&
           !!this.outgoing.username)));
  },
};


// enum consts

// .source
AccountConfig.kSourceUser = 1; // user manually entered the config
AccountConfig.kSourceXML = 2; // config from XML from ISP or Mozilla DB
AccountConfig.kSourceGuess = 3; // guessConfig()


/**
 * <copied from="mailnews/base/prefs/content/accountcreation/accountConfig.js"
 * license="MPL" />
 * with many modifications to remove unneeded things
 *
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
 * @param account {AccountConfig}
 * The account data to be modified. It may or may not contain placeholders.
 * After this function, it should not contain placeholders anymore.
 * This object will be modified in-place.
 *
 * @param emailfull {String}
 * Full email address of this account, e.g. "joe@example.com".
 * Empty of incomplete email addresses will/may be rejected.
 */
function replaceVariables(account, emailfull)
{
  var emailsplit = emailfull.split("@");
  var emaillocal = sanitize.nonemptystring(emailsplit[0]);
  var emaildomain = sanitize.nonemptystring(emailsplit[1]);

  var otherVariables = {};
  otherVariables.EMAILADDRESS = emailfull;
  otherVariables.EMAILLOCALPART = emaillocal;
  otherVariables.EMAILDOMAIN = emaildomain;

  account.incoming.username =
      _replaceVariable(account.incoming.username, otherVariables);
  account.incoming.hostname =
      _replaceVariable(account.incoming.hostname, otherVariables);
}

function _replaceVariable(variable, values)
{
  var str = variable;
  if (typeof(str) != "string")
    return str;

  for (var varname in values)
      str = str.replace("%" + varname + "%", values[varname]);

  return str;
}

/**
 * User tried to configure an email address from a domain we don't support
 */
function InvalidDomainError(msg) {
  UserError.call(this, msg);
}
InvalidDomainError.prototype = {
}
extend(InvalidDomainError, UserError);

module.exports =  {
  makeNewAccount : makeNewAccount,
  verifyEmailAddressDomain : verifyEmailAddressDomain,
  InvalidDomainError : InvalidDomainError,
};
