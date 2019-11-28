/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/**
 * Util functions independent of UI
 *
 * (c) 2014-2017 Ben Bucksch
 * License: MIT
 */

/**
 * Some common, generic functions
 */

/**
 * Takes all functions/objects from |sourceScope|
 * and adds them to |targetScope|.
 */
function importAll(sourceScope, targetScope)
{
  for (var name in sourceScope)
    targetScope[name] = sourceScope[name];
}

/**
 * Create a subtype
 */
function extend(child, supertype)
{
  var properties = Object.create(null);
  Object.getOwnPropertyNames(child.prototype).forEach(function(key) {
    properties[key] = Object.getOwnPropertyDescriptor(child.prototype, key);
  });
  child.prototype = Object.create(supertype.prototype, properties);
}

/**
 * Copy properties of |source| into |target|
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
  console.assert(test, errorMsg);
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
  var id = setTimeout(function() {
    try {
      func();
    } catch (e) { errorCallback(e); }
  }, delay);
  return new TimeoutAbortable(id, errorCallback);
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
  assert(typeof(interval) == "number" && interval > 0);
  assert(typeof(errorCallback) == "function" || !errorCallback);
  if (!errorCallback)
    errorCallback = errorInBackend;
  var id = setInterval(function() {
    try {
      func();
    } catch (e) { errorCallback(e); }
  }, interval);
  return new IntervalAbortable(id);
}


/**
 * Reads UTF8 data from a URL.
 *
 * @param url {String}   what you want to read
 * @return {String}   the contents of the file, as one long string
 */
function readURLasUTF8(url)
{
  assert(url && typeof(url) == "string", "uri must be a string");
  var req = new XMLHttpRequest();
  ddebug("trying to open " + url);
  req.onerror = function (e) { console.error(e); }
  req.onload = function () {}
  req.open("GET", url, false); // sync
  req.send(); // blocks
  return req.responseText;
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
 * Get the language of the browser UI
 * @returns {String} e.g. "en-US"
 * @see also getExtLocale()
 */
function getUILocale()
{
  // TODO Port to Electron
  var locale = chrome.i18n.getMessage("@@ui_locale").replace(/_/g, "-");
  if (locale == "de")
    locale = "de-DE";
  else if (locale == "en")
    locale = "en-US";
  return locale;
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
  // TODO implement, using User Agent string?
  return "other";
}

/**
 * The browser version of the runtime
 */
function getBrowserVersion()
{
  return process.versions.chrome;
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
    dummy.to.provoke.a.native.exception += 1; // force a native exception ...
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

function ImplementThis(msg)
{
  Exception.call(this, msg);
}
extend(ImplementThis, Exception);

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
  cancel : function()
  {
  }
}

/**
 * Utility implementation, for allowing to abort a setTimeout()
 * in a uniform way.
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
 * Utility implementation, for allowing to abort a setInterval()
 * in a uniform way.
 * Use like: return new IntervalAbortable(setInterval(function(){ ... }, 0));
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

// Turns a JS Promise into an Abortable (which you can't abort)
function PromiseAbortable(promise, successCallback, errorCallback)
{
  promise.then(successCallback).catch(errorCallback);
}
PromiseAbortable.prototype =
{
  cancel : function()
  {
  },
}
extend(PromiseAbortable, Abortable);

// For Fetch API. It has inverse thinking again, as usual.
function ControllerAbortable()
{
  this._controller = new AbortController();
}
ControllerAbortable.prototype =
{
  get signal() {
    return this._controller.signal;
  },
  cancel : function()
  {
    this._controller.abort();
  },
}
extend(ControllerAbortable, Abortable);



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

function arrayContains(array, element)
{
  return array.indexOf(element) != -1;
}

// Polyfill for Array.find()
if ( !Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    enumerable: false,
    value: function(func) {
      return this.filter(func)[0];
    }
  });
}

/**
 * Removes all array elements for which |func| returns true.
 * @param array {Array}
 * @param func {Function(element)}
 *    element is an item in |array|
 *    If the function returns true, this element will be removed
 *    from the array.
 */
function arrayRemoveAllWhere(array, func)
{
  assert(typeof(func) == "function");
  assert(typeof(array.length) == "number");
  for (var i = 0; i < array.length; i++)
  {
    if (func(array[i]))
    {
      array.splice(i, 1);
      i--;
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


function ddebug(text)
{
  console.log(text);
}

function debugObject(obj, name, maxDepth, curDepth)
{
  console.dir(obj);
}

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
  console.error("ERROR (from backend): " + e);
  console.error("Stack:\n" + (e.stack ? e.stack : "none"));
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
 * Create a query string from a JS map
 *
 * @param {Object} JS map { name1 : "value", name2: "othervalue" }
 * @returns queryString {String} query string WITHOUT the leading question mark
 */
function createQueryString(queryObject)
{
  var queryString = "";
  for (var name in queryObject) {
    queryString += name + "=" + queryObject[name] + "&";
  }
  // Remove trailing ampersand
  queryString = queryString.replace(/&$/, "");
  return queryString;
}

if (typeof(exports) == "undefined") {
  exports = {};
}
exports.importAll = importAll;
exports.extend = extend;
exports.mixInto = mixInto;
exports.assert = assert;
exports.makeCallback = makeCallback;
exports.Exception = Exception;
exports.NotReached = NotReached;
exports.ImplementThis = ImplementThis;
exports.UserError = UserError;
exports.Abortable = Abortable;
exports.SuccessiveAbortable = SuccessiveAbortable;
exports.PromiseAbortable = PromiseAbortable;
exports.ControllerAbortable = ControllerAbortable;
exports.runAsync = runAsync;
exports.runPeriodically = runPeriodically;
exports.readURLasUTF8 = readURLasUTF8;
exports.splitLines = splitLines;
exports.pluralform = pluralform;
exports.getUILocale = getUILocale;
exports.getOS = getOS;
exports.getBrowserVersion = getBrowserVersion;
exports.ensureArray = ensureArray;
exports.arrayRemove = arrayRemove;
exports.arrayContains = arrayContains;
exports.arrayRemoveAllWhere = arrayRemoveAllWhere;
exports.deepCopy = deepCopy;
exports.errorInBackend = errorInBackend;
exports.ddebug = ddebug;
exports.debugObject = debugObject;
exports.dumpObject = dumpObject;
exports.parseURLQueryString = parseURLQueryString;
exports.createURLQueryString = createURLQueryString;
