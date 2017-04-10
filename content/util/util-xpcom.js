/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Ben Bucksch <ben.bucksch  beonex.com>
 * Portions created by the Initial Developer are Copyright (C) 2008 - 2017
 * the Initial Developer. All Rights Reserved.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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
 * Some common, generic functions
 */

const EXPORTED_SYMBOLS = [ "Cc", "Ci", "Cu",
  "sqlCallback", "loadJS", "importJSM",
  "makeNSIURI", "readURLasUTF8", "readFile", "writeFile",
  "promptService", "ourPref", "generalPref",
  "DOMParser", "XMLSerializer",
  "findSomeBrowserWindow",
  "XPCOMUtils",  "getProfileDir", "getSpecialDir", "getOS",
  "getErrorText", "convertException" ];

// to not pullute Firefox global namespace, load into a scope using subscriptloader
// (same for util/*.js)

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/NetUtil.jsm");
Cu.import("resource://corvette/util/preferences-xpcom.js");

/**
 * Wrapper for Components.utils.import() that hides the absolute URL.
 * @param path {String} e.g. "email/account-list.js"
 * @param scope {Object} where to import the symbols. Normally just |this|.
 */
function importJSM(path, scope) {
  assert(scope, "Scope must be passed to importJSM");
  if (path.indexOf("://") == -1) {
    path = "chrome://corvette/content/" + path;
  }
  try {
    Cu.import(path, scope);
  } catch (e) {
    errorInBackend(e);
  }
}

XPCOMUtils.defineLazyServiceGetter(this, "promptService",
    "@mozilla.org/embedcomp/prompt-service;1", "nsIPromptService");
const DOMParser = new Components.Constructor(
  "@mozilla.org/xmlextras/domparser;1", Ci.nsIDOMParser);
const XMLSerializer = new Components.Constructor(
  "@mozilla.org/xmlextras/xmlserializer;1", Ci.nsIDOMSerializer);

XPCOMUtils.defineLazyGetter(this, "ourPref", function()
{
  return new Preferences("corvette.");
});
XPCOMUtils.defineLazyGetter(this, "generalPref", function()
{
  return Preferences;
});

/**
 * @returns {nsIFile} the current profile directory
 */
function getProfileDir()
{
  return getSpecialDir("ProfD");
}
/**
 * Convenience for nsIDirectoryService
 * @returns {nsIFile}
 */
function getSpecialDir(key)
{
  // @mozilla.org/file/directory_service using nsIProperties
  return Services.dirsvc.get(key, Ci.nsIFile);
}

/**
 * Shortcut for mozISubScriptLoader
 *
 * @param url {String} the absolute URL of the JavaScript file to load
 * @param scope {Object} script will be loaded into this object
 */
function loadJS(url, scope)
{
  if (url.indexOf("://") == -1) {
    url = "chrome://corvette/content/" + url;
  }
  // mozIJSSubScriptLoader
  Services.scriptloader.loadSubScript(url, scope, "UTF-8");
}

/**
 * @param uriStr {String}
 * @result {nsIURI}
 */
function makeNSIURI(uriStr)
{
  return Services.io.newURI(uriStr, null, null);
}



/**
 * Reads UTF8 data from a URL.
 *
 * @param uri {nsIURI or String}   what you want to read
 * @return {String}   the contents of the file, as one long string
 */
function readURLasUTF8(uri)
{
  assert(uri && (uri instanceof Ci.nsIURI || typeof(uri) == "string"), "uri must be an nsIURI or string");
  try {
    var chan = NetUtil.newChannel({ uri: uri, loadUsingSystemPrincipal: true });
    var is = Cc["@mozilla.org/intl/converter-input-stream;1"]
             .createInstance(Ci.nsIConverterInputStream);
    is.init(chan.open(), "UTF-8", 1024,
            Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

    var content = "";
    var strOut = new Object();
    try {
      while (is.readString(1024, strOut) != 0)
        content += strOut.value;
    // catch in outer try/catch
    } finally {
      is.close();
    }

    return content;
  } catch (e) {
    // TODO this has a numeric error message. We need to ship translations
    // into human language.
    throw e;
  }
}


/**
 * Read a file from disk, as UTF-8, and return the contents as plaintext.
 * @param file {nsIFile}
 * @return {Array of String} contents of file. one string per line.
 */
function readFile(file)
{
  assert(file instanceof Ci.nsIFile, "argument must be an nsIFile");
  try {
    var fileis = Cc["@mozilla.org/network/file-input-stream;1"]
        .createInstance(Ci.nsIFileInputStream);
    const MODE_READONLY = 1;
    const PERMISSIONS = 420; // 0644
    fileis.init(file, MODE_READONLY, PERMISSIONS, false);
    try {
      var convis = Cc["@mozilla.org/intl/converter-input-stream;1"]
          .createInstance(Ci.nsIConverterInputStream);
      convis.init(fileis, "UTF-8", 0, 0x0000);
      try {
        assert(convis instanceof Ci.nsIUnicharLineInputStream);
        var result = new Array();
        var line = { value : null };
        var haveMore = true;
        while (haveMore)
        {
          haveMore = convis.readLine(line)
          result.push(line.value);
        }
      } finally {
        convis.close(); // also closes the underlying stream
      }
    } finally {
      fileis.close(); // is already closed if no exception was thrown by convOS.init
    }
    return result;
  } catch (e) {
    throw "Reading file " + file.path + " failed: " + e;
  }
}


/**
 * Writes a string to a file, as UTF-8.
 * @param  file {nsIFile}  the file to write to.
 *     If already existing, it will be overwritten. TODO or will fail?
 * @param  content {String} what to write to the file
 */
function writeFile(file, content)
{
  assert(file instanceof Ci.nsIFile, "file argument must be an nsIFile");
  try {
    var fileos = Cc["@mozilla.org/network/file-output-stream;1"]
       .createInstance(Ci.nsIFileOutputStream);
    // @see <http://mxr.mozilla.org/mozilla-central/source/nsprpub/pr/include/prio.h>
    const PERM = 420; // 0644
    fileos.init(file, 0x02 | 0x08 | 0x20, PERM, 0); // write, create, truncate
    try {
      var convos = Cc["@mozilla.org/intl/converter-output-stream;1"]
          .createInstance(Ci.nsIConverterOutputStream);
      convos.init(fileos, "UTF-8", 0, 0x0000);
      try {
        var success = convos.writeString(content);
        if (!success)
          throw "writeString() failed";
      } finally {
        convos.close(); // also closes the underlying stream
      }
    } finally {
      fileos.close(); // is already closed if no exception was thrown by convOS.init
    }
  } catch (e) {
    throw "Writing file " + file.path + " failed: " + e;
  }
}

/**
 * The operating system we're running on currently.
 *
 * @returns {String-enum}
 *     "win" =  Windows
 *     "mac" =  Mac OS X
 *     "unix" =  Linux, BSD, Solaris etc.
 *     "android" = Android
 *     "other" = anything not fitting above
 */
function getOS()
{
  // @mozilla.org/xre/app-info using nsIXULRuntime
  switch(Services.appinfo.OS)
  {
    case "WINNT":
      return "win";
    case "Darwin":
      return "mac";
    case "Linux":
    case "FreeBSD":
    case "NetBSD":
    case "OpenBSD":
    case "DragonFly":
    case "SunOS": // Solaris
    case "IRIX64":
    case "AIX":
    case "HP-UX":
      return "unix";
    case "Android":
      return "android";
    default:
      return "other";
  }
}

/**
 * When you need to go to the UI, from the JSM.
 * Avoid at all costs.
 */
function findSomeBrowserWindow()
{
  // nsIWindowMediator
  return Services.wm.getMostRecentWindow("navigator:browser");
}


/**
 * Callback for asynchronous SQL queries.
 *
 * This class implements mozIStorageStatementCallback. Use with
 * mozIStorageStatement::executeAsync.
 *
 * If the query produces no results, the first callback
 * will be called with the empty array.
 * The second callback is called in case of an error.
 *
 * Only one of the provided callbacks is called. The callback
 * which is called exactly once.
 *
 * @param successCallback {Function(rows)} rows {Array of mozIStorageRow}
 * @param errorCallback {Function(msg)} msg {String} user-displayable error message
 */
function sqlCallback(successCallback, errorCallback)
{
  assert(typeof(successCallback) == "function");
  assert(typeof(errorCallback) == "function");
  this._successCallback = successCallback;
  this._errorCallback = errorCallback;
  this._results = [];
  // Store the original stack so we can use it if there is an exception
  this._callStack = Error().stack;
}
sqlCallback.prototype =
{
  /**
   * @param result {mozIStoragerResultSet} <https://developer.mozilla.org/en/Storage#Asynchronously>
   */
  handleResult : function(resultSet)
  {
    for (var row = resultSet.getNextRow(); row; row = resultSet.getNextRow())
    {
      this._results.push(row);
    }
  },
  /**
   * @param error {mozIStorageError} <https://developer.mozilla.org/en/mozIStorageError>
   */
  handleError : function(error)
  {
    if (! this._error)
      this._error = error.message;
    else
      errorInBackend("Another SQL error: " + error.message);
  },
  handleCompletion : function(reason)
  {
    if (this._error || reason != Ci.mozIStorageStatementCallback.REASON_FINISHED) {
      // Put the caller's stack into the exception
      var ex = new Exception(this._error ? this._error : "Query canceled or aborted (" + reason + ")");
      ex.stack = this._callStack;
      this._errorCallback(ex);
    }
    else
    {
      try {
        this._successCallback(this._results);
      } catch (e) { this._errorCallback(e); }
    }
  }
}

/**
 * Cleans up exceptions into a common format
 * @param e {Error or Exception or nsIException or String}
 * @param Exception
 */
function convertException(e) {
  // Convert native C++ exceptions to the same format as JS ex
  if (e instanceof Ci.nsIException) {
    // Some exceptions do not have a message but work
    // if converted to a string. See #1644
    var e2 = new Exception(e.message || e.toString());
    e2.code = e.result;
    e2.stack = e.location
        ? _convertStackFrameToString(e.location)
        : Error().stack;
    e2.rootErrorMsg = e.inner ? e.inner.message : null;
    e = e2;
  }
  // If we didn't get an Exception object (but e.g. a string),
  // create one and give it a stack
  if (typeof e != "object") {
    e = new Exception(e);
  }
  if ( !e.stack) {
    e.stack = Error().stack;
  }
  e.stack = _cleanupStack(e.stack);
  return e;
}


/**
 * Convert an XPCOM error stack into format of JS stacks
 * @param frame {nsIStackFrame}
 * @returns {String} multi-line, same format as Error().stack
 */
function _convertStackFrameToString(frame) {
  if ( !frame.name && !frame.filename) {
    return "";
  }
  var result = frame.name + "@" + frame.filename + ":" + frame.lineNumber + "\n";
  if (frame.caller) {
    result += _convertStackFrameToString(frame.caller);
  }
  return result;
}

/**
 * Remove any functions from the stack that are related to
 * showing or sending the error.
 */
function _cleanupStack(s) {
  assert(typeof(s) == "string");
  return s.split(/\n/).filter(function(element) {
    if (element.match(/^sendErrorToServer/) ||
        element.match(/^_showErrorDialog/) ||
        element.match(/^convertException/) ||
        element.match(/^UserError/) ||
        element.match(/^Exception/) ||
        element.match(/^NotReached/) ||
        element.match(/^assert/) ||
        element.match(/^errorCritical/) ||
        element.match(/^errorNonCritical/) ||
        element.match(/^errorInBackend/))
      return false;
    return true;
    }).join("\n");
}

/**
 * @param nsresult {Integer}  an XPCOM error code
 * @returns {String} an error message
 *     Mostly based on the C++ macro constants, so
 *     may be very technical and in English.
 *     If no name found, returns the error code in hex.
 * @see <https://developer.mozilla.org/en/Table_Of_Errors>
 */
function getErrorText(nsresult)
{
  assert(typeof(nsresult) == "number");
  // name is the C++ macro name of the error
  // code is the numeric error code
  for (var name in Components.results)
  {
    var code = Components.results[name];
    if (code == nsresult)
    {
      // Just base the text on the C++ macro name.
      // If we wanted to make a nice human-readable, translated error msg,
      // we could insert a string bundle read right here.
      var text = name.toString().replace("NS_ERROR_", "")
          .replace("_", " ").toLowerCase();
      return text;
    }
  }
  // Just return error code as hex code
  return "0x" + nsresult.toString(16).toUpperCase();
}
