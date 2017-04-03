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

const EXPORTED_SYMBOLS = [ "Cc", "Ci", "Cu", "extend", "mixInto", "assert",
  "makeCallback", "sqlCallback", "loadJS", "importJSM", "runAsync", "runPeriodically",
  "makeNSIURI", "readURLasUTF8", "readFile", "writeFile", "splitLines",
  "promptService", "ourPref", "generalPref",
  "DOMParser", "XMLSerializer",
  "StringBundle", "getExtensionFullVersion", "findSomeBrowserWindow", "UserError",
  "Exception", "NotReached", "Abortable", "TimeoutAbortable", "IntervalAbortable",
  "SuccessiveAbortable", "XPCOMUtils",  "getProfileDir", "getSpecialDir", "getOS",
  "parseURLQueryString", "createURLQueryString", "pluralform",
  "arrayRemove", "arrayContains", "objForEach", "deepCopy", "getErrorText", "convertException",
  "errorInBackend", "kDebug", "debug", "ddebug", "debugObject", "dumpObject", "ensureArray" ];

// to not pullute Firefox global namespace, load into a scope using subscriptloader
// (same for util/*.js)

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/NetUtil.jsm");
Cu.import("resource://corvette/util/preferences-xpcom.js");
//loadJS("resource://corvette/util/preferences.js");
loadJS("resource://corvette/util/stringbundle.js");

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
 * Create a subtype.
 */
function extend(child, supertype)
{
  child.prototype.__proto__ = supertype.prototype;
}

/**
 * Copy properties of |source| into |target|.
 * This is an alternative to extend().
 */
function mixInto(source, target)
{
  for (var property in source)
  {
    if (typeof(target[property]) == "undefined" &&
        // avoid execution of getters/setters
        !source.__lookupGetter__(property) &&
        !source.__lookupSetter__(property))
    {
      target[property] = source[property];
    }
  }
}

function assert(test, errorMsg)
{
  if (!test)
    throw new NotReached(errorMsg ? errorMsg : "Bug: assertion failed");
}

function makeCallback(obj, func)
{
  return function()
  {
    return func.apply(obj, arguments);
  }
}

/**
 * Shortcut for mozISubScriptLoader
 *
 * @param url {String} the URL of the JavaScript file to load
 * @param scope {Object} script will be loaded into this object
 */
function loadJS(url, scope)
{
  // mozIJSSubScriptLoader
  Services.scriptloader.loadSubScript(url, scope, "UTF-8");
}

/**
 * Removes |element| from |array|.
 * @param array {Array} to be modified. Will be modified in-place.
 * @param element {Object} If |array| has a member that equals |element|,
 *    the array member will be removed.
 * @param all {boolean}
 *     if true: remove all occurences of |element| in |array.
 *     if false: remove only the first hit
 * @returns {Integer} number of hits removed (0, 1 or more)
 */
function arrayRemove(array, element, all)
{
  var found = 0;
  var pos = 0;
  while ((pos = array.indexOf(element, pos)) != -1)
  {
    array.splice(pos, 1);
    found++
    if ( ! all)
      return found;
  }
  return found;
}

/**
 * Check whether |element| is in |array|
 * @param array {Array}
 * @param element {Object}
 * @returns {boolean} true, if |array| has a member that equals |element|
 */
function arrayContains(array, element)
{
  return array.indexOf(element) != -1;
}

/**
 * Like Array.forEach(), but iterate over all properties of an object
 *
 * @param obj {Object} Object over which to iterate
 * @param callback {Function} function to call on each property
 * @param self {Object} obj to pass as |this| to the function call
 */
function objForEach(obj, callback, self) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      callback.call(self, obj[key]);
    }
  }
}

function Exception(msg)
{
  this._message = msg;

  // get stack
  try {
    not.found.here += 1; // force a native exception ...
  } catch (e) {
    this.stack = e.stack; // ... to get the current stack
  }
  //ddebug("ERROR (exception): " + msg + "\nStack:\n" + this.stack);
}
Exception.prototype =
{
  get message()
  {
    return this._message;
  },
  set message(msg)
  {
    this._message = msg;
  },
  toString : function()
  {
    return this._message;
  }
}

function NotReached(msg)
{
  Exception.call(this, msg);
}
extend(NotReached, Exception);

/**
 * Error caused by the user, so it should never be sent to the server.
 * Things like bad passwords, or email domains.
 */
function UserError(msg)
{
  Exception.call(this, msg);
  this.causedByUser = true;
}
UserError.prototype =
{
}
extend(UserError, Exception);

/**
 * A handle for an async function which you can cancel.
 * The async function will return an object of this type (a subtype)
 * and you can call cancel() when you feel like killing the function.
 */
function Abortable()
{
}
Abortable.prototype =
{
  /**
   * Stop the process immediately.
   *
   * The process may call at most the error callback with a CancelledExeption.
   *
   * It must be possible to call cancel() at any time, even several times or
   * when the process has already successfully finished. In such cases, the
   * cancel() must be a no-op and not produce any errors, neither by throwing
   * nor by calling the errorCallback again.
   */
  cancel : function()
  {
  }
}

/**
 * Utility implementation, for allowing to abort a setTimeout.
 * Use like: return new TimeoutAbortable(setTimeout(function(){ ... }, 0));
 * @param setTimeoutID {Integer}  Return value of setTimeout()
 */
function TimeoutAbortable(setTimeoutID)
{
  this._id = setTimeoutID;
}
TimeoutAbortable.prototype =
{
  cancel : function()
  {
    clearTimeout(this._id);
  }
}
extend(TimeoutAbortable, Abortable);

/**
 * Utility implementation, for allowing to abort a setTimeout.
 * Use like: return new TimeoutAbortable(setTimeout(function(){ ... }, 0));
 * @param setIntervalID {Integer}  Return value of setInterval()
 */
function IntervalAbortable(setIntervalID)
{
  this._id = setIntervalID;
}
IntervalAbortable.prototype =
{
  cancel : function()
  {
    clearInterval(this._id);
  }
}
extend(IntervalAbortable, Abortable);


// Allows you to make several network calls, but return only one Abortable object.
function SuccessiveAbortable()
{
  this._current = null;
}
SuccessiveAbortable.prototype =
{
  set current(abortable)
  {
    assert(abortable instanceof Abortable || abortable == null,
        "need an Abortable object (or null)");
    this._current = abortable;
  },
  get current()
  {
    return this._current;
  },
  cancel : function()
  {
    if (this._current)
      this._current.cancel();
  },
}
extend(SuccessiveAbortable, Abortable);


/**
 * Runs the given function sometime later.
 *
 * For reliable operation (esp. beyond 0), you must save
 * the returned Abortable until the function executed.
 *
 * @param func {Function}
 * @param errorCallback {Function(e)} Called when |func| throws
 * @param delay {Integer} in ms. Default 0.
 * @returns {Abortable}
 */
function runAsync(func, errorCallback, delay)
{
  assert(typeof(delay) == "number" || !delay);
  assert(typeof(errorCallback) == "function" || !errorCallback);
  if (!delay)
    delay = 0;
  if (!errorCallback)
    errorCallback = errorInBackend;

  //setTimeout(func, delay);
  var timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
  timer.initWithCallback(function()
  {
    try {
      func();
    } catch (e) { errorCallback(e); }
  }, delay, timer.TYPE_ONE_SHOT);

  return new TimerAbortable(timer);
}

/**
 * Runs the given function periodically, i.e. in intervals
 *
 * For reliable operation, you must save the returned
 * Abortable until you abort. When the Abortable goes
 * out of scope, the callbacks may or may not cease
 * to be fired.
 *
 * @param func {Function}
 * @param errorCallback {Function(e)} Called when |func| throws (each time!)
 * @param interval {Integer} in ms
 * @returns {Abortable}
 */
function runPeriodically(func, errorCallback, interval)
{
  assert(typeof(interval) == "number" && interval > 0);
  assert(typeof(errorCallback) == "function" || !errorCallback);
  if (!errorCallback)
    errorCallback = errorInBackend;

  //setInterval(func, interval);
  //var next = new Date();
  //next.setSeconds(next.getSeconds() + interval/1000);
  //ddebug("run periodically every " + (interval/1000) +
  //    "s, first time at " + next.toLocaleTimeString());
  var timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
  timer.initWithCallback(function()
  {
    try {
      func();
    } catch (e) { errorCallback(e); }
  }, interval, timer.TYPE_REPEATING_SLACK);

  return new TimerAbortable(timer);
}

function TimerAbortable(timer)
{
  assert(timer instanceof Ci.nsITimer);
  this._timer = timer;
}
TimerAbortable.prototype =
{
  cancel : function()
  {
    if ( ! this._timer)
      return;
    this._timer.cancel();
    this._timer = null;
  },
};
extend(TimerAbortable, Abortable);


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
 * Takes a string (which is typically the content of a file,
 * e.g. the result returned from readURLUTF8() ), and splits
 * it into lines, and returns an array with one string per line
 *
 * Linebreaks are not contained in the result,,
 * and all of \r\n, (Windows) \r (Mac) and \n (Unix) counts as linebreak.
 *
 * @param content {String} one long string with the whole file
 * @return {Array of String} one string per line (no linebreaks)
 */
function splitLines(content)
{
  content = content.replace("\r\n", "\n");
  content = content.replace("\r", "\n");
  return content.split("\n");
}

/**
 * 3-way plural form for 0, 1 and >1. Picks the corresponding UI string.
 * Also replaces %COUNT% with the number.
 *
 * @param count {Integer}
 * @param str {String} a;b;c
 * @return {String}
 *   if count = 0, use a
 *   if count = 1, use b
 *   if count > 1, use c
 */
function pluralform(count, str)
{
  var sp = str.split(";");
  assert(sp.length == 3, "pluralform: expected 3 parts in str: " + str);
  var index;
  if (count == 0)
    index = 0;
  else if (count == 1)
    index = 1;
  else
    index = 2;
  return sp[index].replace("%COUNT%", count);
}

/**
 * Get our own version
 */
function getExtensionFullVersion()
{
  return build.version; // build.js
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
 * Normally, var b = a; (with a being an Object) copies only the pointer,
 * and does not copy the whole object.
 * E.g. when you do
 * var a = { foo: 1 };
 * var b = a;
 * b.foo = 2;
 * then a.foo == 2, not 1.
 * This is what you normally expect, but sometimes you really need a copy.
 *
 * This function tries to copy the whole object, recursively.
 * E.g. you can do:
 * var a = { foo: 1 };
 * var b = deepCopy(a);
 * b.foo = 2;
 * then a.foo == 1.
 *
 * The function can only deal with simple objects, though, not with classes.
 * I.e. you can use it for JSON-like objects, but
 * not objects from class hierarchies.
 */
function deepCopy(org)
{
  if (typeof(org) == "undefined")
    return undefined;
  if (org == null)
    return null;
  if (typeof(org) == "string")
    return org;
  if (typeof(org) == "number")
    return org;
  if (typeof(org) == "boolean")
    return org == true;
  if (typeof(org) == "function")
    return org;
  if (typeof(org) != "object")
    throw "can't copy objects of type " + typeof(org) + " yet";

  //TODO still instanceof org != instanceof copy
  //var result = new org.constructor();
  var result = new Object();
  if (typeof(org.length) != "undefined")
    var result = new Array();
  for (var prop in org)
    result[prop] = deepCopy(org[prop]);
  return result;
}

var kDebugAlsoOnErrorConsole = true;
var kDebug = null;

function debug(text) {
  ddebug(text);
}

/**
 * Output some text on the console which helps in debugging,
 * but not for end-users.
 */
function ddebug(text)
{
  if (kDebug === null) {
    kDebug = ourPref.get("debug.enable", false);
  }
  if (!kDebug) {
    return;
  }
  dump(text + "\n");
  if (!kDebugAlsoOnErrorConsole)
    return;

  // nsIConsoleService
  Services.console.logStringMessage(text);
}

/**
 * Output contents of object on console.
 * @see dumpObject()
 */
function debugObject(obj, name, maxDepth, curDepth)
{
  ddebug(dumpObject(obj, name, maxDepth, curDepth));
}

/**
 * Return the contents of an object as multi-line string, for debugging.
 * @param obj {Object} What you want to show
 * @param name {String} What this object is. Used as prefix in output.
 * @param maxDepth {Integer} How many levels of properties to access.
 *    1 = just the properties directly on |obj|
 * @param curDepth {Integer} internal, ignore
 */
function dumpObject(obj, name, maxDepth, curDepth)
{
  if (curDepth == undefined)
    curDepth = 1;
  if (maxDepth != undefined && curDepth > maxDepth)
    return "";

  var result = "";
  var i = 0;
  for (var prop in obj)
  {
    i++;
    if (typeof(obj[prop]) == "xml")
    {
      result += name + "." + prop + "=[object]" + "\n";
      result += dumpObject(obj[prop], name + "." + prop, maxDepth, curDepth+1);
    }
    else if (typeof(obj[prop]) == "object")
    {
      if (obj[prop] && typeof(obj[prop].length) != "undefined")
        result += name + "." + prop + "=[probably array, length " + obj[prop].length + "]" + "\n";
      else
        result += name + "." + prop + "=[object]" + "\n";
      result += dumpObject(obj[prop], name + "." + prop, maxDepth, curDepth+1);
    }
    else if (typeof(obj[prop]) == "function")
      result += name + "." + prop + "=[function]" + "\n";
    else
      result += name + "." + prop + "=" + obj[prop] + "\n";
  }
  if ( ! i)
    result += name + " is empty\n";
  return result;
}

/**
 * You are in the backend without UI, and there's
 * no way to redesign your API to pass the errors to the UI.
 * This should be avoided at all costs and is basically a bug.
 */
function errorInBackend(e)
{
  e = convertException(e);
  ddebug("ERROR (from backend): " + e);
  ddebug("Stack:\n" + (e.stack ? e.stack : "none"));
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



/**
 * Parses a URL query string into an object.
 *
 * @param queryString {String} query ("?foo=bar&baz=3") part of the URL,
 *     with or without the leading question mark
 * @param contextURL {String} The full URL where the query comes from.
 *     This is just for error reporting.
 * @param paramCallback({ name {String}, value {String}, allParams {Array, like result})
 * @returns {Object} JS map { name1 : "value", name2: "othervalue" }
 */
function parseURLQueryString(queryString, contextURL, paramCallback)
{
  var queryParams = {};
  if (queryString.charAt(0) == "?")
    queryString = queryString.substr(1); // remove leading "?", if it exists
  var queries = queryString.split("&");
  for (var i = 0; i < queries.length; i++) {
    try {
      var querySplit = queries[i].split("=");
      var p = { name : querySplit[0] , value : querySplit[1] || "" };
      p.value = p.value.replace(/\+/g, " "); // "+" is space, before decoding
      try {
        p.value = decodeURIComponent(p.value);
      } catch (e) {
        // malformed URI sequence usually means we tried to decode something
        // that was the wrong encoding. Use unescape instead.
        if (e.message == "malformed URI sequence") {
          p.value = unescape(p.value);
        } else {
          throw e;
        }
      }
      if (typeof(paramCallback) == "function") {
        p.allParams = queryParams;
        paramCallback(p);
      }
      queryParams[p.name] = p.value;
    } catch (e) {
      // Errors parsing the query string are not fatal, we should just continue
      e.uri = contextURL;
      errorInBackend(e);
    }
  }
  return queryParams;
}

/**
 * Create a URL query string from a JS map
 *
 * @param {Object} JS map { name1 : "value", name2: "othervalue" }
 * @returns queryString {String} query ("foo=bar&baz=3") part
 *     of the URL, without (!) the leading question mark
 */
function createURLQueryString(queryParams)
{
  var queryString = "";
  for (var name in queryParams) {
    queryString += name + "=" + queryParams[name] + "&";
  }
  queryString = queryString.replace(/&$/, ""); // Remove trailing "&"
  return queryString;
}

/**
 * Guarantee that passed in item is an array.
 *
 * @param {Object} Could be an array, could be a single item
 * @returns array {Array} original Array or new Array item
 */
function ensureArray(item) {
  if (!Array.isArray(item)) {
    item = new Array(item);
  }
  return item;
}
