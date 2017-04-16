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
 * Contributor(s):
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
 * This is a small wrapper around XMLHttpRequest, which solves various
 * inadequacies of the API, e.g. error handling. It is entirely generic and
 * can be used for purposes outside of even mail.
 *
 * It does not provide download progress, but assumes that the
 * fetched resource is so small (<1 10 KB) that the roundtrip and
 * response generation is far more significant than the
 * download time of the response. In other words, it's fine for RPC,
 * but not for bigger file downloads.
 */

var util = require("util/util");
util.importAll(util, this);
var sanitize = require("util/sanitizeDatatypes").sanitize;
var gStringBundle = new require("trex/stringbundle").StringBundle("util");

/**
 * Set up a fetch.
 *
 * All of the following parameters (apart from the callbacks) are passed
 * as object, with the property name matching the parameter name listed
 * below.
 * @param url {String}   URL of the server function.
 *    ATTENTION: The caller needs to make sure that the URL is secure to call.
 * @param urlArgs {Object, associative array} Parameters to add
 *   to the end of the URL as query string. E.g.
 *   { foo: "bla", bar: "blub blub" } will add "?foo=bla&bar=blub%20blub"
 *   to the URL
 *   (unless the URL already has a "?", then it adds "&foo...").
 *   The values will be encoded as needed, so pass them unencoded.
 * @param headers {Object, associative array} Extra headers
 *   that will be added as HTTP headers.
 *   { foo: "blub blub" } will add "Foo: Blub blub"
 *   The values will *not* be encoded, so pass them encoded if needed.
 * @param bodyFormArgs {Object, associative array} Like urlArgs,
 *   just that the params will be sent x-www-form-urlencoded
 *   in the body, like a HTML form post.
 *   The values will be urlComponentEncoded, so pass them unencoded.
 *   This cannot be used together with |uploadBody|.
 * @param uploadBody {Object}   Arbitrary object, which to use as
 *   body of the HTTP request. Will also set the mimetype accordingly.
 *   Only supported object types, currently only E4X is supported
 *   (sending XML).
 *   Usually, when you have nothing to upload, just pass |null| or |undefined|.
 * @param method {String-enum}   HTTP method to use.
 *   "GET", "POST" or "DELETE"
 *   Only influences the HTTP request method,
 *   i.e. first line of the HTTP request, not the body or parameters.
 *   Use POST when you modify server state,
 *   GET when you only request information.
 *
 * @param successCallback {Function(result {String})}
 *   Called when the server call worked (no errors).
 *   |result| will contain the body of the HTTP reponse, as string.
 * @param errorCallback {Function(ex)}
 *   Called in case of error. ex contains the error
 *   with a user-displayable but not localized |.message| and maybe a
 *   |.code|, which can be either
 *  - an nsresult error code,
 *  - an HTTP result error code (0...1000) or
 *  - negative: 0...-100 :
 *     -2 = can't resolve server in DNS etc.
 *     -4 = response body (e.g. XML) malformed
 */
function FetchHTTP(args, successCallback, errorCallback)
{
  assert(typeof(successCallback) == "function", "BUG: need successCallback");
  assert(typeof(errorCallback) == "function", "BUG: need errorCallback");
  assert(!(args.bodyFormArgs && args.uploadBody),
      "Cannot combine bodyFormArgs with uploadBody");
  this._url = sanitize.string(args.url);
  this._method = sanitize.enum(args.method, ["GET", "POST", "HEAD", "DELETE"], "GET");
  this._urlArgs = args.urlArgs ? args.urlArgs : {};
  this._bodyFormArgs = args.bodyFormArgs ? args.bodyFormArgs : null;
  this._headers = args.headers ? args.headers : {};
  this._uploadBody = args.uploadBody;
  if (typeof(args.uploadJSON) == "object")
    this._uploadJSON = args.uploadJSON;
  this._successCallback = successCallback;
  this._errorCallback = errorCallback;
}
FetchHTTP.prototype =
{
  _url : null, // URL as passed to ctor, without arguments
  _urlArgs : null,
  _headers : null,
  _bodyFormArgs : null,
  _uploadBody : null,
  _uploadJSON : null,
  _post : null,
  _successCallback : null,
  _errorCallback : null,
  _request : null, // the XMLHttpRequest object
  _callStack : null, // The original call stack
  result : null,

  start : function()
  {
    // URL
    var url = this._url;
    for (var name in this._urlArgs)
    {
      url += (url.indexOf("?") == -1 ? "?" : "&") +
              name + "=" + encodeURIComponent(this._urlArgs[name]);
    }

    // body
    var mimetype = null;
    var body = null;
    if (this._uploadBody)
    {
      body = this._uploadBody;
      if (typeof(this._uploadBody) == "xml")
        mimetype = "text/xml; charset=UTF-8";
      else if (typeof(this._uploadBody) == "string")
        mimetype = "text/plain; charset=UTF-8";
    }
    else if (this._uploadJSON)
    {
      mimetype = "text/json; charset=UTF-8";
      body = JSON.stringify(this._uploadJSON);
    }
    else if (this._bodyFormArgs)
    {
      mimetype = "application/x-www-form-urlencoded; charset=UTF-8";
      body = "";
      for (var name in this._bodyFormArgs)
      {
        body += (body ? "&" : "") + name + "=" +
            encodeURIComponent(this._bodyFormArgs[name]);
      }
    }

    // Fire
    this._request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance(Ci.nsIXMLHttpRequest);
    var request = this._request;
    try {
      // prevents dialogs like "bad cert" and makes the request fail instead
      request.mozBackgroundRequest = true;
    } catch (e) { errorNonCritical(e); }
    ddebug("contacting <" + url + ">");
    request.open(this._method, url);
    request.channel.loadGroup = null;
    // Disable Mozilla HTTP cache, causes bugs, see #305 and #459
    request.channel.loadFlags |= Ci.nsIRequest.LOAD_BYPASS_CACHE;

    // Headers
    if (mimetype)
      request.setRequestHeader("Content-Type", mimetype);
    for (var name in this._headers)
    {
      request.setRequestHeader(name, this._headers[name]);
      if (name == "Cookie")
      {
        // Websites are not allowed to set this, but chrome is, so no problem.
        // Nevertheless, the cookie lib later overwrites our header.
        // request.channel.setCookie(this._headers[name]); -- crashes
        // So, deactivate that Firefox cookie lib.
        request.channel.loadFlags |= Ci.nsIRequest.LOAD_ANONYMOUS;
      }
    }
    //if (this._headers || mimetype) {
    //  request.getRequestHeaders().forEach(...);
    //}
    if (body) {
      ddebug("with body: " + body);
    }
    // needs bug 407190 patch v4 (or higher) - uncomment if that lands.
    // try {
    //    var channel = request.channel.QueryInterface(Ci.nsIHttpChannel2);
    //    channel.connectTimeout = 5;
    //    channel.requestTimeout = 5;
    //    } catch (e) { dump(e + "\n"); }

    var me = this;
    request.onload = function() { me._response(true); }
    request.onerror = function() { me._response(false); }
    request.send(body);
    // Store the original stack so we can use it if there is an exception
    this._callStack = Error().stack;
  },
  _response : function(success, exStored)
  {
    try
    {
    var errorCode = null;
    var errorStr = null;

    if (success && this._request.status >= 200 &&
        this._request.status < 300) // HTTP level success
    {
      try
      {
        // response
        var mimetype = this._request.getResponseHeader("Content-Type");
        if (!mimetype)
          mimetype = "";
        mimetype = mimetype.split(";")[0];
        if (mimetype == "text/xml" ||
            mimetype == "application/xml" ||
            mimetype == "text/rdf" ||
            // Match application/foo+xml
            /^application\/[a-z0-9]+\+xml$/.test(mimetype) ||
            // Match text/foo+xml
            /^text\/[a-z0-9]+\+xml$/.test(mimetype))
        {
          this.result = this._request.responseXML;
        }
        else
        {
          this.result = this._request.responseText;
        }
      }
      catch (e)
      {
        success = false;
        errorCode = -4;
        errorStr = gStringBundle.GetStringFromName("bad_response_content.error") + ": " + e;
      }
    }
    else
    {
      success = false;
      errorCode = this._request.status;
      errorStr = this._request.statusText;
      if (errorCode == 0 && errorStr == "")
      {
        // If we can't resolve the hostname in DNS etc.,
        errorCode = -2;
        errorStr = gStringBundle.GetStringFromName("cannot_contact_server.error");
        try {
          // try to get a more precise error from nsIHttpChannel / nsIRequest
          errorCode = this._request.channel.status; // gives an nsresult
          errorStr = errorStr + "\n("+ getErrorText(errorCode) +")"; //util.js
        } catch (e) {} // ignore, we already have set a default above
      }
    }

    // Callbacks
    try {
      if (success)
        this._successCallback(this.result);
      else if (exStored)
        this._errorCallback(exStored);
      else {
        // Put the caller's stack into the exception
        var ex = new ServerException(errorStr, errorCode, this._url);
        ex.stack = this._callStack;
        this._errorCallback(ex);
      }

      if (this._finishedCallback)
        this._finishedCallback(this);
    } catch (e) { this._errorInCallback(e); }

    } catch (e) {
      // error in our fetchhttp._response() code
      errorInBackend(e);
      throw(e); // to error console
    }
  },
  _errorInCallback : function(e)
  {
    // error in callback or our fetchhttp._response() code
    try {
      this._errorCallback(e);
    } catch (e) {
      errorInBackend(e); // error in errorCallback, too!
      throw(e); // to error console
    }
  },
  /**
   * Call this between start() and finishedCallback fired.
   */
  cancel : function(ex)
  {
    // TODO must able able to call cancel() at any time, without errors

    this._request.abort();

    // Need to manually call error handler
    // <https://bugzilla.mozilla.org/show_bug.cgi?id=218236#c11>
    this._response(false, ex ? ex : new UserCancelledException());
  },
  /**
   * Allows caller or lib to be notified when the call is done.
   * This is useful to enable and disable a Cancel button in the UI,
   * which allows to cancel the network request.
   */
  setFinishedCallback : function(finishedCallback)
  {
    this._finishedCallback = finishedCallback;
  },
  /**
   * Gets an HTTP header value that the server sent.
   * @param headername {String}
   * @returns {String}   value of the header
   *    or null if
   *      - called before server responsed
   *      - header does not exist in response
   */
  getResponseHeader : function(headername)
  {
    return this._request.getResponseHeader(headername);
  },
  /**
   * Gets the text of the HTTP response.
   * @returns {String}   response body as plaintext.
   *    null if called before server responded
   */
  getResponseText : function()
  {
    return this._request.responseText;
  },
}
extend(FetchHTTP, Abortable);

/**
 * This is an alternative implementation of FetchHTTP,
 * purely for testing purposes, which does not make any
 * network connection, but takes a hardcoded response
 * from the caller and feeds it to the caller's callbacks.
 * You can set either a success (optionally with a body) or
 * an error with error code and msg. You can also set
 * the response headers. It's totally stupid and all hardcoded,
 * really just for testing.
 */
function FakeFetchHTTP()
{
  FetchHTTP.apply(this, arguments);
}
FakeFetchHTTP.prototype =
{
  _responseHeaders : {},
  getResponseHeader : function(headername)
  {
    return this._responseHeaders[headername];
  },
  /**
   * Call this instead of start(), to call the successCallback
   * @param response {XML or String or null) will be passed verbatim
   *     as parameter to successCallback()
   * @param responseHeaders {Object} (optional)
   */
  setSuccessResponse : function(response, responseHeaders)
  {
    if (responseHeaders)
      this._responseHeaders = responseHeaders;
    try {
      this._successCallback(response);
      if (this._finishedCallback)
        this._finishedCallback(this);
    } catch (e) {
      this._errorInCallback(e);
    }
  },
  /**
   * Call this instead of start(), to call the errorCallback
   * @param httpCode {Integer} HTTP error code (e.g. 404)
   * @param httpStatusText {String} The line after the HTTP error code,
   *     e.g. "Not Found"
   * @param responseHeaders {Object} (optional)
   */
  setErrorResponse : function(httpCode, httpStatusText, responseHeaders)
  {
    assert(httpCode >= 400 && httpStatusText);
    if (responseHeaders)
      this._responseHeaders = responseHeaders;
    try {
      this._errorCallback(new ServerException(httpStatusText, httpCode, this._url));
      if (this._finishedCallback)
        this._finishedCallback(this);
    } catch (e) {
      this._errorInCallback(e);
    }
  },
  start : function()
  {
    throw NotReached("You should call setSuccess/ErrorResponse()");
  },
}


function UserCancelledException(msg)
{
  // The user knows they cancelled so I don't see a need
  // for a message to that effect.
  if (!msg)
    msg = "";
  this.causedByUser = true;
  Exception.call(this, msg);
}
UserCancelledException.prototype =
{
}
extend(UserCancelledException, Exception);

function ServerException(serverMsg, code, uri)
{
  var msg = serverMsg;
  if (code >= 300 && code < 600) { // HTTP error code
    msg += " " + code;
  }
  msg += " <" + uri + ">";  Exception.call(this, msg);
  this.rootErrorMsg = serverMsg;
  this.code = code;
  this.uri = uri;
}
ServerException.prototype =
{
}
extend(ServerException, Exception);


module.exports = {
  FetchHTTP : FetchHTTP,
  FakeFetchHTTP : FakeFetchHTTP,
  ServerException : ServerException,
  UserCancelledException : UserCancelledException,
};
