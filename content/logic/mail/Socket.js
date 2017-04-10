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

var EXPORTED_SYMBOLS = [ "Socket", "LineSocket", "RejectBadCert", ];

Components.utils.import("resource://corvette/util/util.js");
loadJS("util/sanitizeDatatypes.js", this);
var gStringBundle = new StringBundle("util");

/**
 * Generic socket implementation
 * Wrapper for the network communication.
 * You send data with send(), and receive data by passing a function to
 * receive() or calling sendAndReceive() with a function.
 *
 * @param p {Object} with the following named params as properties
 * @param hostname {String} server name to contact
 * @param port {Integer} server port number to contact
 * @param ssl {Integer-Enum} 1 = no SSL, 2 = Normal SSL/TLS, 3 = STARTTLS
 * @param timeout {Integer} In seconds. If no answer after this time, abort.
 * @param charset {String} Interpret the bytes from the network using this charset
 * @param errorCallback {Function(e)}
 *     Called when an error happens during the connection livetime,
 *     e.g. the network connection drops or there are read errors.
 *     Also called when your receiveStringCallback throws.
 *     Errors during connection setup (e.g. server not found) are not
 *     reported here, but in the errorCallback in openSocket().
 */
function Socket(p)
{
  this.hostname = sanitize.hostname(p.hostname);
  this.port = sanitize.integerRange(p.port, 0, 65535);
  this.ssl = sanitize.enum(p.ssl, [ 1, 2, 3]);
  this.proxyHostname = p.proxyHostname ? sanitize.hostname(p.proxyHostname) : null;
  this.proxyPort = p.proxyHostname ? sanitize.integerRange(p.proxyPort, 0, 65535) : null;
  this.timeout = typeof(p.timeout) == "undefined" || p.timeout < 0
      ? 60 : sanitize.integer(p.timeout);
  this.charset = sanitize.enum(p.charset, [ "UTF-8", "ISO-8859-1", "ASCII" ], "UTF-8");
  assert(typeof(p.errorCallback) == "function", "need errorCallback");
  this._connErrorCallback = p.errorCallback;
}
Socket.prototype =
{
  // Our API

  /**
   * Opens the network connection to the server.
   * @param successCallback {Function()}
   *     The connection is open
   * @param errorCallback {Function(e)}
   *     Errors during connection setup are reported here.
   *     E.g. server not found or not responding, or
   *     the successCallback throwing.
   *     @see ctor errorCallback, which is different, that gets the errors
   *     *after* the conn is open.
   */
  openSocket : function(successCallback, errorCallback)
  {
    this._createSocket(this.hostname, this.port, this.ssl, this.timeout, this.charset,
       this.proxyHostname, this.proxyPort, successCallback, errorCallback);
  },

  /**
   * Defines the function which will be called when response data
   * from the server arrives.
   * Note that this function will be called whenever something arrives
   * (not necessarily the chucks you expect) and possibly several times.
   *
   * @param receiver {Function(inData {Array of String})
   */
  registerReceiveStringCallback : function(receiver)
  {
    assert(typeof(receiver) == "function", "receiver must be a function");
    this._receiveStringCallback = receiver;
  },

  /**
   * Send some data out.
   * The response will go to whatever function was last set as receiver.
   * @param outData {String} What to send to the server
   */
  sendString : function(outData)
  {
    assert(typeof(outData) == "string", "need the data to send, as string");
    assert(typeof(this._receiveStringCallback) == "function", "need a receive function");
    if (this.protocolDebug)
      ddebug(this.hostname + " OUT: " + outData);

    this._outStream.writeString(outData);
  },

  /**
   * Send some data out. The responses will go to the |receiver| param.
   * @param outData @see sendString()
   * @param receiver @see registerReceiveStringCallback()
   */
  sendAndReceiveString : function(outData, receiver)
  {
    /* TODO restore
    var oldReceiver = this._receiveStringCallback;
    var self = this;
    this.registerReceiveStringCallback(function(inData)
    {
      receiver(inData);
      self.registerReceiveStringCallback(oldReceiver);
    });
    */
    this.registerReceiveStringCallback(receiver);
    this.sendString(outData);
  },

  close : function()
  {
    this._wantToClose = true;
    this._outStream.close();
    this._inStream.close();
  },

  protocolDebug : false, // whether to dump all communciation with the server


  // Implementation

  /**
   * @see registerReceiveStringCallback()
   */
  _receiveStringCallback : null,
  _socket : null,
  _inStream : null,
  _outStream : null,
  _wantToClose : false,
  _connErrorCallback : null,
  _startErrorCallback : null,
  _started : false,

  //<copied from="thunderbird-source/mailnews/base/prefs/content/accountcreation/guessConfig.js" license="MPL 1.1">
  _createSocket : function(hostname, port, ssl, timeout, charset,
      proxyHostname, proxyPort, successCallback, errorCallback)
  {
    assert(typeof(successCallback) == "function", "need successCallback");
    assert(typeof(errorCallback) == "function", "need errorCallback");
    this._startErrorCallback = errorCallback;
    if (this.protocolDebug)
      ddebug("opening connection to " + hostname + ":" + port);
    var proxyInfo = null;
    if (proxyHostname && proxyPort)
    {
      var proxyInfoServ = Cc["@mozilla.org/network/protocol-proxy-service;1"]
          .getService(Ci.nsIProtocolProxyService);
      // http://mdn.beonex.com/en/nsIProtocolProxyService
      // http://mxr.mozilla.org/mozilla-central/source/netwerk/base/public/nsIProtocolProxyCallback.idl
      //proxyInfoServ.asyncResolve(ioService.newURI("https://" + hostname + ":" + port, 0, function())
      if (this.protocolDebug)
        ddebug("...via proxy " + proxyHostname + ":" + proxyPort);
      proxyInfo = proxyInfoServ.newProxyInfo("direct",
          proxyHostname, proxyPort, 0, 0, null);
    }
    var socketServ = Cc["@mozilla.org/network/socket-transport-service;1"]
        .getService(Ci.nsISocketTransportService);
    var socketType = sanitize.translate(ssl, { 1 : null, 2 : "ssl", 3 : "starttls"});
    var socket = socketServ.createTransport([socketType], socketType ? 1 : 0,
        hostname, port, proxyInfo);
    socket.setTimeout(Ci.nsISocketTransport.TIMEOUT_CONNECT, timeout);
    socket.setTimeout(Ci.nsISocketTransport.TIMEOUT_READ_WRITE, timeout);
    try {
      socket.securityCallbacks = new RejectBadCert(errorCallback);
    } catch (e) { errorCallback(e); }
    this._socket = socket;
    var ConverterInputStream = Components.Constructor(
        "@mozilla.org/intl/converter-input-stream;1",
        "nsIConverterInputStream", "init");
    var ConverterOutputStream = Components.Constructor(
        "@mozilla.org/intl/converter-output-stream;1",
        "nsIConverterOutputStream", "init");
    this._kBufferSize = 40*1024;
    var socketIS = socket.openInputStream(0, this._kBufferSize, 0);
    var socketOS = socket.openOutputStream(0, this._kBufferSize, 0);
    this._inStream = new ConverterInputStream(socketIS,
        charset, this.kBufferSize,
        Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
    this._outStream = new ConverterOutputStream(socketOS,
        charset, this.kBufferSize,
        Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

    //try {
      var pump = Cc["@mozilla.org/network/input-stream-pump;1"]
          .createInstance(Ci.nsIInputStreamPump);
      pump.init(socketIS, -1, -1, 0, 0, false);
      pump.asyncRead(this, null);
      ddebug("_createSocket finished");
      //this._started = true; -- set only after we received some data
      runAsync(successCallback);
      return new SocketAbortable(socket);
    //} catch (e) { errorCallback(e); }
  },
  // </copied>

  // nsIRequestObserver
  onStartRequest: function(request, context)
  {
    ddebug("onstartrequest");
    // This isn't really helpful, because when we're offline, this is called (!),
    // and then the connection is stopped immediately thereafter.
  },
  // nsIRequestObserver
  onStopRequest: function(request, context, status)
  {
    try {
      if (this.protocolDebug)
        ddebug(this.hostname + " stream was closed");
      this._inStream.close();
      this._outStream.close();
      var self = this;
      if ( !this._wantToClose) {
        var ex = new Exception(gStringBundle.get("socket.aborted.error", [ self.hostname ]));
        if ( !this._started) {
          this._startErrorCallback(ex);
        } else {
          this._connErrorCallback(ex);
        }
      }
    } catch (e) { this._connErrorCallback(e); }
  },
  // nsIStreamListener
  onDataAvailable: function(request, context, inputStream, offset, count)
  {
    try {
      assert(typeof(this._receiveStringCallback) == "function",
          "I have data from the server, but nobody wants to hear it");
      //assert(inputStream == this._inStream,
      //    "onDataAvailable with unexpected inputStream");
      var out = {};
      this._inStream.readString(this._kBufferSize, out);
      var inputData = out.value;
      if (this.protocolDebug)
        ddebug(this.hostname + " IN:  " + inputData);
      this._started = true;
      this._receiveStringCallback(inputData);
    } catch (e) { this._connErrorCallback(e); throw e; } // report and abort stream
  },
  QueryInterface: function(iid)
  {
    if (iid.equals(Ci.nsIStreamListener) ||
        iid.equals(Ci.nsIRequestObserver))
      return this;
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },
}

/**
 * Same as Socket, just splits incoming lines.
 *
 * @param p {Object} with params, @see Socket , plus:
 * @param separator {String} Server response data will be split by this.
 *     Also, it will be appended to outData before sending.
 *     Special value "newline": it will send CRLR = \r\n, but accept CRLF, CR and LF.
 */
function LineSocket(p)
{
  Socket.call(this, p);

  if (p.separator == "newline")
  {
    this.inSeparator = /\r\n|\r|\n/;
    this.outSeparator = "\r\n";
  }
  else
  {
    this.inSeparator = sanitize.string(p.separator);
    this.outSeparator = sanitize.string(p.separator);
  }
}
LineSocket.prototype =
{

  /**
   * @see Socket.registerReceiveStringCallback()
   *
   * @param receiver {Function(lines)
   *     lines {Array of String}  the incoming network data,
   *         split up into lines.
   */
  registerReceiveLinesCallback : function(receiver)
  {
    assert(typeof(receiver) == "function", "receiver must be a function");
    this._receiveLinesCallback = receiver;
    this.registerReceiveStringCallback(makeCallback(this, this._receiveStringToLines));
  },

  /**
   * @see Socket.sendString()
   * @param outData {String or Array of String} What to send to the server
   *    We'll append the separator.
   *    If you pass an array, we'll also interperse the separator.
   */
  sendLines : function(outData)
  {
    assert(typeof(this._receiveLinesCallback) == "function", "need a receive function");

    if (typeof(outData) == "string")
      ;
    else if (typeof(outData) == "object" &&
        typeof(outData.length) == "number") // array
      outData = outData.join(this.outSeparator);
    else
      throw NotReached("need the data to send, as String or Array of Strings");

    outData += this.outSeparator;

    this.sendString(outData);
  },

  /**
   * @see Socket.sendAndReceiveString()
   * @param outData @see sendLines()
   * @param receiver @see registerReceiveLinesCallback()
   */
  sendAndReceiveLines : function(outData, receiver)
  {
    this.registerReceiveLinexCallback(receiver); // TODO restore
    this.sendLines(outData);
  },

  /**
   * @see registerReceiveLinesCallback()
   */
  _receiveLinesCallback : null,

  _receiveStringToLines : function(bytes)
  {
    this._receiveLinesCallback(bytes.split(this.inSeparator));
  },
}
extend(LineSocket, Socket);

function SocketAbortable(transport)
{
  Abortable.call(this);
  assert(transport instanceof Ci.nsITransport);
  this._transport = transport;
}
SocketAbortable.prototype =
{
  cancel : function()
  {
    try {
      this._transport.close(Components.results.NS_ERROR_ABORT);
    } catch (e) {
      ddebug("canceling socket failed: " + e);
    }
  },
}
extend(SocketAbortable, Abortable);
//</copied>

/**
 * Implementation of nsIBadCertListener2 and nsISSLErrorListener.
 * It's called by NSS via the socket to notify us of bad SSL certificates,
 * e.g. for the wrong domain, unknown issuer etc.
 * In these cases, the SSL protections are void, so it's important to
 * stop these connections.
 * The default handler will show a dialog to the user and
 * ask him what to do, which we don't want.
 *
 * @param certErrorCallback {Function} (optional)
 *    Just notifies you.
 */
function RejectBadCert(certErrorCallback)
{
  this.errorCallback = certErrorCallback;
}
RejectBadCert.prototype =
{
  notifyCertProblem: function(socketInfo, status, targetSite)
  {
    if (this.errorCallback)
      this.errorCallback(gStringBundle.get("ssl.cert.error"));
    return true; // suppress mozilla dialog
  },
  notifySSLError: function(socketInfo, error, targetSite)
  {
    if (this.errorCallback)
      this.errorCallback(gStringBundle.get("ssl.cert.error"));
    return true; // suppress mozilla dialog
  },

  // nsIInterfaceRequestor
  getInterface: function(iid)
  {
    return this.QueryInterface(iid);
  },
  // nsISupports
  QueryInterface: function(iid)
  {
    if (iid.equals(Ci.nsIBadCertListener2) ||
        iid.equals(Ci.nsISSLErrorListener) ||
        iid.equals(Ci.nsIInterfaceRequestor) ||
        iid.equals(Ci.nsISupports))
      return this;
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },
};
