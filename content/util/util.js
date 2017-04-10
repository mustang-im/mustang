/**
 * Util functions independent of UI
 *
 * (c) 2014-2017 Ben Bucksch
 * License: MIT
 */
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

function makeCallback(obj, func)
{
  return function()
  {
    return func.apply(obj, arguments);
  }
}

function assert(test, errorMsg)
{
  if (!test)
    throw new NotReached(errorMsg ? errorMsg : "Bug: assertion failed");
}

function ddebug(msg) {
  if (console) {
    console.debug(msg);
  }
}


/**
 * Cleans up exceptions into a common format
 * @param e {Error or Exception or nsIException or String}
 * @param Exception
 */
function convertException(e) {
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
 * Remove any functions from the stack that are related to
 * showing or sending the error.
 */
function _cleanupStack(s) {
  assert(typeof(s) == "string");
  return s.split(/\n/).filter(function(element) {
    if (element.match(/^convertException/) ||
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

function runAsync(func, errorCallback) {
  setTimeout(function() {
    try {
      func();
    } catch (e) { errorCallback(e); }
  }, 0);
}

/**
 * Parses a URL query string into an object.
 *
 * @param queryString {String} query ("?foo=bar&baz=3") part of the URL,
 *     with or without the leading question mark
 * @returns {Object} JS map { name1 : "value", name2: "othervalue" }
 */
function parseURLQueryString(queryString)
{
  var queryParams = {};
  if (queryString.charAt(0) == "?" || queryString.charAt(0) == "#")
    queryString = queryString.substr(1); // remove leading "?" or "#", if it exists
  var queries = queryString.split("&");
  for (var i = 0; i < queries.length; i++) {
    try {
      if ( !queries[i]) {
        continue;
      }
      var querySplit = queries[i].split("=");
      var value = querySplit[1].replace(/\+/g, " "); // "+" is space, before decoding
      queryParams[querySplit[0]] = decodeURIComponent(value);
    } catch (e) {
      // Errors parsing the query string are not fatal, we should just continue
      errorNonCritical(e);
    }
  }
  return queryParams;
}

function createURLQueryString(url, args) {
  for (var name in args) {
    url += (url.indexOf("?") == -1 ? "?" : "&") +
            name + "=" + encodeURIComponent(args[name]);
  }
  return url;
}


function getLang() {
  return "en";
}


/**
 * To insert string into SPARQL
 */
function esc(str) {
  // TODO
  return str
    .replace(/\&/g, "and")
    .replace(/\"/g, "'")
    .replace(/ /g, "_")
    .replace(/\(/g, "%28") // TODO doesn't work, neither does \\u28
    .replace(/\)/g, "%29");
}

function dbpediaIDForTitle(title) {
  title = title
      .replace(/ \&.*/g, "") // HACK: With "A&B", take only A
      .replace(/, .*/g, "") // HACK: With "A, B & C", take only A
      .replace(/ /g, "_"); // Spaces -> _
  title = title[0] + title.substr(1).toLowerCase(); // Double words in lowercase
  return "dbpedia:" + title;
}

var cRDFPrefixes = {
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  dc: "http://purl.org/dc/terms/",
  dc10: "http://purl.org/dc/elements/1.0/",
  dc11: "http://purl.org/dc/elements/1.1/",
  foaf: "http://xmlns.com/foaf/0.1/",
  dbpedia: "http://dbpedia.org/resource/",
  dbpediaprop: "http://dbpedia.org/property/",
  dbpediaowl: "http://dbpedia.org/ontology/",
  "dbpedia-prop": "http://dbpedia.org/property/",
  "dbpedia-owl": "http://dbpedia.org/ontology/",
  //freebase: "http://rdf.freebase.com/ns/",
  freebase: "http://rdf.basekb.com/ns/",
  geo: "http://www.w3.org/2003/01/geo/wgs84_pos#",
  geonames: "http://www.geonames.org/ontology#",
  factbook: "http://wifo5-04.informatik.uni-mannheim.de/factbook/ns#",
  owl: "http://www.w3.org/2002/07/owl#",
  skos: "http://www.w3.org/2004/02/skos/core#",
  dmoz: "http://dmoz.org/rdf/",
  dmozcat: "http://dmoz.org/rdf/cat/",
  du: "http://rdf.labrasol.org/",
};

function sparqlSelect(query, params, resultCallback, errorCallback) {
  assert(params && typeof(params) == "object", "Need params");
  var url;
  if (params.url) {
    url = params.url;
  } else if (params.endpoint) {
    url = "/sparql/" + params.endpoint + "/";
  } else {
    url = "/sparql/m1/";
  }
  params.prefixes = params.prefixes || cRDFPrefixes;
  if (params.prefixes) {
    for (var prefix in params.prefixes) {
      if (query.indexOf(prefix + ":") != -1) {
        query = "PREFIX " + prefix + ": <" + params.prefixes[prefix] + "> " + query;
      }
    }
  }
  ddebug("Running SPARQL query: " + query);
  loadURL({
    url : url,
    urlArgs : {
      query : query,
      format : "application/sparql-results+json",
      output : "json",
      //callback : "load",
    },
    dataType : "json",
  }, function(json) {
    try {
      if (json.results.bindings.length == 0) {
        errorCallback(new SPARQLException(new ServerException("Nothing found", 0, url), query));
        return;
      }
      // drop the .value, and make it a real Array
      var results = [];
      var bindings = json.results.bindings;
      for (var i = 0, l = bindings.length; i < l; i++) {
        var cur = bindings[i];
        var result = {};
        for (var name in cur) {
          result[name] = cur[name].value;
        }
        results.push(result);
      }
      resultCallback(results);
    } catch (e) { errorCallback(e); }
  }, function(e) {
    errorCallback(new SPARQLException(e, query));
  });
}

function sparqlSelect1(query, params, resultCallback, errorCallback) {
  var myResultCallback = function(results) {
    resultCallback(results[0]);
  };
  query += " LIMIT 1";
  sparqlSelect(query, params, myResultCallback, errorCallback);
}

/**
 * This is str.replace(find, replace, "g"), but portable
 */
String.prototype.replaceAll = function(find, replace) {
  var r = this.replace(find, replace);
  if (r == this) {
    return r;
  }
  return r.replaceAll(find, replace);
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

function ServerException(serverMsg, code, uri)
{
  var msg = serverMsg;
  /*if (code >= 300 && code < 600) { // HTTP error code
    msg += " " + code;
  }
  msg += "\n\n<" + uri + ">";*/
  Exception.call(this, msg);
  this.rootErrorMsg = serverMsg;
  this.code = code;
  this.uri = uri;
}
ServerException.prototype =
{
}
extend(ServerException, Exception);

/**
 * The search had no results
 */
function NoResult(e)
{
  var msg = "No result"; // TODO localize
  Exception.call(this, msg);
}
NoResult.prototype =
{
}
extend(NoResult, Exception);



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
 * Allows to call many async functions,
 * and wait for them *all* to complete.
        var w = new Waiter(successCallback, errorCallback);
        for (var lang in allLanguages) {
          lodTitles(storage, lang, w.success(), w.error());
          lodDescrs(storage, lang, w.success(), w.error());
          var infoSuccess = w.success();
          lodInfo(storage, lang, function() {
            // Do NOT call w.success() here directly. It's too late.
            infoSuccess();
          }, w.error());
        }
 */
function Waiter(successCallback, errorCallback) {
  assert(typeof(successCallback) == "function", "Need successCallback");
  assert(typeof(errorCallback) == "function", "Need errorCallback");
  this.successCallback = successCallback;
  this.errorCallback = errorCallback;
  this.waiting = 0;
  this.hadError = false;
}
Waiter.prototype = {
  // config
  reportOnlyFirstError : true,
  successAfterError : false,

  // get callbacks
  success : function() {
    var self = this;
    self.waiting++;
    return function() {
      if (--self.waiting == 0 &&
          (self.successAfterError || !self.hadError)) {
        self.successCallback();
      }
    };
  },
  error : function() {
    var self = this;
    return function(e) {
      if ( !self.hadError || !self.reportOnlyFirstError) {
        self.hadError = true;
        self.errorCallback(e);
      }
      if (--self.waiting == 0 &&
          self.successAfterError) {
        self.successCallback();
      }
    };
  },
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

/*
 * Creates a download URL for file contents in a JS string,
 * and loads it in the current window,
 * which triggers the "Save As..." dialog in the browser.
 * This allows to download a file that you have constructed in a JS variable.
 * It's a HACK, though.
 *
 * @param contents {String}   the file contents
 * @param mimetype {String}   the file type
 */
function downloadFromVariable(contents, mimetype) {
  assert(contents && typeof(contents) == "string", "need file contents");
  assert(mimetype && typeof(mimetype) == "string", "need mimetype");
  assert(mimetype.indexOf("/") > 0 && mimetype.indexOf(" ") == -1, "mimetype is malformed");
  var file = new Blob([ contents ], { type : mimetype });
  var reader = new FileReader();
  reader.onload = function(e) { window.location = e.target.result; };
  reader.readAsDataURL(file);
}


