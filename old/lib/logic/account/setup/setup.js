/**
 * This contains the mechanics of account object creation,
 * which gets the account class of an appropriate type.
 */

import AccountConfig from "./AccountConfig";
import JXON from "../../../util/JXON";
import { sanitize } from "../../../util/sanitizeDatatypes";
import { StringBundle } from "../../../util/stringbundle";
const gStringBundle = new StringBundle("mail");
import { Abortable, SuccessiveAbortable, PromiseAbortable, assert, UserError } from "../../../util/util";
import { DOMParser } from "@xmldom/xmldom";
import dns from "dns";
import r2 from "r2";

const mozillaISPDBURL = "https://autoconfig.thunderbird.net/v1.1/";

/**
 * Checks whether the domain of the email address is supported by us.
 *
 * @param emailAddress {String}
 * @param successCallback {Function(config {AccountConfig})} check passed
 * @param errorCallback check failed, with reason
 * @returns {Abortable}
 */
export function verifyEmailAddressDomain(emailAddress, successCallback, errorCallback) {
  var domain = getDomainForEmailAddress(emailAddress);
  return findAccountConfig(domain, emailAddress,
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
 * map domain {String} -> {AccountConfig}
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
 * @param emailAddress {String} email address
 * @param aSuccessCallback {Function(config {AccountConfig})}
 *     Called, if the provider could be found and is supported.
 * @param errorCallback {Function(msg {String or Exception})}
 *     Called, if we cannot configure that email address.
 * @returns {Abortable}
 */
export function findAccountConfig(emailAddress, aSuccessCallback, errorCallback) {
  let domain = getDomainForEmailAddress(emailAddress);
  var successCallback = config => {
    gCachedConfigs[domain] = config;
    aSuccessCallback(config);
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
  sab.current = getMX(domain, mxHostnames => {
    var providerDomains = [];
    for (let mx of mxHostnames) {
      try {
        providerDomains.push(getBaseDomainFromHost(mx));
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

    // First, try to get the config from the ISP directly
    sab.current = fetchConfigFromISP(domain, ac => {
      console.log("found config for " + domain);
      successCallback(convertMozillaConfigToOurs(ac, emailAddress));
    }, e => {
      // Try to query the Mozilla ISP database
      // First, try the domain directly, then via MX domain
      sab.current = fetchConfigFromMozillaDB(domain, ac => {
        console.log("found config for " + domain);
        successCallback(convertMozillaConfigToOurs(ac, emailAddress));
      }, e => {
        errorInBackend(e);
        sab.current = fetchConfigFromMozillaDB(providerDomain, ac => {
          console.log("found config for " + providerDomain);
          successCallback(convertMozillaConfigToOurs(ac, emailAddress));
        }, e => {
          errorCallback(new InvalidDomainError(errorMsg));
        });
      });
    }, e => {
      errorCallback(e == "no MX found" || e.code == 404 ? new InvalidDomainError(errorMsg) : e);
    });
  }, errorCallback);
  return sab;
}

/**
 * @param ac {AccountConfig}
 * @returns {Object} provider config
 */
function convertMozillaConfigToOurs(ac, emailAddress) {
  ac.replaceVariables(emailAddress);
  return ac.incoming; // all the properties match, luckily
}

// <copied to="logic/mail/MailAccount.js">
export function getDomainForEmailAddress(emailAddress) {
  var spl = emailAddress.split("@");
  assert(spl.length == 2, gStringBundle.get("error.syntax"));
  return sanitize.hostname(spl[1]);
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
 * Queries the DNS MX for the domain
 * Returns (in successCallback) the hostnames of the MX servers.
 *
 * @param domain {String}
 * @param successCallback {function(hostnames {Array of {String}})
 *   Called when we found an MX for the domain.
 *   For |hostnames|, see description above.
 * @param errorCallback
 * @returns {Abortable}
 */
function getMX_node(domain, successCallback, errorCallback) {
  domain = sanitize.hostname(domain);
  dns.resolveMx(domain, (err, results) => {
    if (err) {
      errorCallback(new Exception(err));
      return;
    }
    if (results.length == 0) {
      errorCallback("no MX found");
      return;
    }
    var hostnames = results.map(result => sanitize.hostname(result.exchange));
    console.log("MX query result: \n" + hostnames.join(", "));
    successCallback(hostnames);
  });
  return new Abortable();
}

function getMX(domain, successCallback, errorCallback) {
  let fetchFunc = async () => {
    let mx = await r2("https://live.thunderbird.net/dns/mx/" + domain).text;
    successCallback(mx.split("\n"));
  };
  return new PromiseAbortable(fetchFunc(), successCallback, errorCallback);
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
function fetchConfigFromMozillaDB(domain, successCallback, errorCallback) {
  domain = sanitize.hostname(domain);
  var url = mozillaISPDBURL + domain;
  //var url = "https://" + domain + "/.well-known/mail/config-v1.1.xml";
  var fetchFunc = async () => {
    let xmlText = await r2(url).text;
    let xmlDoc = new DOMParser().parseFromString(xmlText);
    return readFromXML(JXON.build(xmlDoc));
  };
  return new PromiseAbortable(fetchFunc(), successCallback, errorCallback);
}

function fetchConfigFromISP(domain, successCallback, errorCallback) {
  domain = sanitize.hostname(domain);
  var url = "https://" + domain + "/.well-known/mail/config-v1.1.xml";
  var fetchFunc = async () => {
    let xmlText = await r2(url).text;
    let xmlDoc = new DOMParser().parseFromString(xmlText);
    return readFromXML(JXON.build(xmlDoc));
  };
  return new PromiseAbortable(fetchFunc(), successCallback, errorCallback);
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
function readFromXML(clientConfigXML) {
  function array_or_undef(value) {
    return value === undefined ? [] : value;
  }
  var i, j; // Predeclare loop counters
  var exception;
  if (typeof (clientConfigXML) != "object" ||
    !("clientConfig" in clientConfigXML) ||
    !("emailProvider" in clientConfigXML.clientConfig)) {
    console.log("client config xml = " + JSON.stringify(clientConfigXML));
    throw gStringBundle.get("config.syntax.error");
  }
  var xml = clientConfigXML.clientConfig.emailProvider;

  var d = new AccountConfig();
  d.source = AccountConfig.kSourceXML;

  d.id = sanitize.hostname(xml["@id"]);
  d.displayName = d.id;
  try {
    d.displayName = sanitize.label(xml.displayName);
  } catch (e) { errorInBackend(e); }
  xml.$domain.forEach(domain => {
    try {
      d.domains.push(sanitize.hostname(domain));
    } catch (e) { errorInBackend(e); exception = e; }
  });
  if (d.domains.length == 0) {
    throw exception ? exception : "need proper <domain> in XML";
  }
  exception = null;

  // incoming server
  for (let iX of array_or_undef(xml.$incomingServer)) {
    let iO = d.createNewIncoming(); // output (object)
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

      for (let iXsocketType of array_or_undef(iX.$socketType)) {
        try {
          iO.socketType = sanitize.translate(iXsocketType,
            { plain: 1, SSL: 2, STARTTLS: 3 });
          break; // take first that we support
        } catch (e) { exception = e; }
      }
      if (!iO.socketType) {
        throw exception ? exception : "need proper <socketType> in XML";
      }
      exception = null;

      for (let iXauth of array_or_undef(iX.$authentication)) {
        try {
          iO.auth = sanitize.translate(iXauth,
            {
              "password-cleartext": "password-cleartext",
              "plain": "password-cleartext",
              "password-encrypted": "password-encrypted",
              "secure": "password-encrypted",
              "GSSAPI": "GSSAPI",
              "NTLM": "NTLM",
            });
          break; // take first that we support
        } catch (e) { exception = e; }
      }
      if (!iO.auth) {
        throw exception ? exception : "need proper <authentication> in XML";
      }
      exception = null;

      // defaults are in accountConfig.js
      if (iO.type == "pop3" && "pop3" in iX) {
        try {
          if ("leaveMessagesOnServer" in iX.pop3)
            iO.leaveMessagesOnServer =
              sanitize.boolean(iX.pop3.leaveMessagesOnServer);
          if ("daysToLeaveMessagesOnServer" in iX.pop3) {
            iO.daysToLeaveMessagesOnServer =
              sanitize.integer(iX.pop3.daysToLeaveMessagesOnServer);
          }
        } catch (e) { errorInBackend(e); }
        try {
          if ("downloadOnBiff" in iX.pop3)
            iO.downloadOnBiff = sanitize.boolean(iX.pop3.downloadOnBiff);
        } catch (e) { errorInBackend(e); }
      }

      // processed successfully, now add to result object
      if (!d.incoming.hostname) { // first valid
        d.incoming = iO;
      } else {
        d.incomingAlternatives.push(iO);
      }
    } catch (e) { exception = e; }
  }
  if (!d.incoming.hostname)
    // throw exception for last server
    throw exception ? exception : "Need proper <incomingServer> in XML file";
  exception = null;

  // outgoing server
  for (let oX of array_or_undef(xml.$outgoingServer)) {
    let oO = d.createNewOutgoing(); // output (object)
    try {
      if (oX["@type"] != "smtp") {
        throw gStringBundle.get("config.syntax.error");
      }
      oO.hostname = sanitize.hostname(oX.hostname);
      oO.port = sanitize.integerRange(oX.port, 1, 65535);

      for (let oXsocketType of array_or_undef(oX.$socketType)) {
        try {
          oO.socketType = sanitize.translate(oXsocketType,
            { plain: 1, SSL: 2, STARTTLS: 3 });
          break; // take first that we support
        } catch (e) { exception = e; }
      }
      if (!oO.socketType) {
        throw exception ? exception : "need proper <socketType> in XML";
      }
      exception = null;

      for (let oXauth of array_or_undef(oX.$authentication)) {
        try {
          oO.auth = sanitize.translate(oXauth,
            {
              // open relay
              "none": "none",
              // inside ISP or corp network
              "client-IP-address": "client-IP-address",
              // hope for the best
              "smtp-after-pop": "smtp-after-pop",
              "password-cleartext": "password-cleartext",
              "plain": "password-cleartext",
              "password-encrypted": "password-encrypted",
              "secure": "password-encrypted",
              "GSSAPI": "GSSAPI",
              "NTLM": "NTLM",
            });
          break; // take first that we support
        } catch (e) { exception = e; }
      }
      if (!oO.auth) {
        throw exception ? exception : "need proper <authentication> in XML";
      }
      exception = null;

      if ("username" in oX ||
        // if password-based auth, we need a username,
        // so go there anyways and throw.
        oO.auth == "password-cleartext" ||
        oO.auth == "password-encrypted") {
        oO.username = sanitize.string(oX.username);
      }

      if ("password" in oX) {
        d.rememberPassword = true;
        oO.password = sanitize.string(oX.password);
      }

      try {
        // defaults are in accountConfig.js
        if ("addThisServer" in oX) {
          oO.addThisServer = sanitize.boolean(oX.addThisServer);
        }
        if ("useGlobalPreferredServer" in oX) {
          oO.useGlobalPreferredServer =
            sanitize.boolean(oX.useGlobalPreferredServer);
        }
      } catch (e) { errorInBackend(e); }

      // processed successfully, now add to result object
      if (!d.outgoing.hostname) { // first valid
        d.outgoing = oO;
      } else {
        d.outgoingAlternatives.push(oO);
      }
    } catch (e) { errorInBackend(e); exception = e; }
  }
  if (!d.outgoing.hostname) {
    // throw exception for last server
    throw exception ? exception : "Need proper <outgoingServer> in XML file";
  }
  exception = null;

  d.inputFields = new Array();
  array_or_undef(xml.$inputField).forEach(inputField => {
    try {
      d.inputFields.push({
        varname: sanitize.alphanumdash(inputField["@key"]).toUpperCase(),
        displayName: sanitize.label(inputField["@label"]),
        exampleValue: sanitize.label(inputField.value)
      });
    } catch (e) { errorInBackend(e); } // for now, don't throw,
    // because we don't support custom fields yet anyways.
  });

  return d;
}

/**
 * User tried to configure an email address from a domain we don't support
 */
export class InvalidDomainError extends UserError {
  constructor(msg) {
    super(msg);
  }
}
