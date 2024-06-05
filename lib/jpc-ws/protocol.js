import WSCall from "./WSCall.js";
import JPCProtocol from "../jpc/protocol.js";
import WebSocketNode from "ws";
import { assert } from "../jpc/util.js";

/**
 * Wire protocol API
 */
export default class JPCWebSocket extends JPCProtocol {
  _wsCall = null;
  _server = null;
  errorCallback = (ex) => console.error(ex);
  /**
   * @param startObject {Object} Will be returned to client in "start" function
   */
  constructor(startObject) {
    super(startObject);
  }

  /**
   * Call one of init() or listen() or connect() before calling any of the other functions.
   */
  async init(webSocket) {
    this._wsCall = new WSCall(webSocket);
    await super.init();
  }

  /**
   * Creates a WebSocket server.
   *
   * Attention: This class currently cannot deal with
   * multiple clients connecting.
   *
   * @param secret {string} passcode that the client must send to be able to connect
   *    TODO implement this
   * @param port {Integer} Between 1024 and 65535
   * @param openPublic {boolean} (optional, default false)
   *   If true, allow other computers from the network to connect.
   *   If false, allow only applications on the local host to connect.
   */
  async listen(secret, port, openPublic) {
    assert(typeof (secret) == "string", "Need secret key");
    assert(typeof (port) == "number", "Need port");
    let host = openPublic ? '0.0.0.0' : '127.0.0.1'; // TODO IPv6
    this._server = new WebSocketNode.Server({
      host: host,
      port: port,
      maxPayload: 0,
    });
    await new Promise(resolve => {
      this._server.on("listening", () => resolve());
    });
    console.log(`Listening JPC WebSocket on ${openPublic ? "all interfaces " : "localhost"}:${port}`);
    this._server.on("connection", webSocket => this.newConnection(webSocket));
  }

  async newConnection(webSocket) {
    try {
      await this.init(webSocket);
    } catch (ex) {
      this.errorCallback(ex);
    }
  }

  async stopListening() {
    if (this._server) {
      this._server.close();
    }
  }

  /**
   * Connects to a WebSocket server.
   *
   * @param secret {string} passcode that the server expects to allow connections
   * @param hostname {string} Optional, default localhost
   * @param port {Integer} Between 1024 and 65535
   */
  async connect(secret, hostname, port) {
    assert(typeof (secret) == "string", "Need secret key");
    assert(typeof (port) == "number", "Need port");
    assert(!hostname || typeof (hostname) == "string", "Invalid hostname");
    hostname = hostname || "localhost";
    let url = `ws://${hostname}:${port}`;
    let webSocket;
    if (typeof WebSocket == "function") { // browser
      webSocket = new WebSocket(url);
      webSocket.on = (eventName, func) => {
        webSocket.addEventListener(eventName, message => func(message.data), false);
      };
    } else { // node.js
      webSocket = new WebSocketNode(url);
    }
    return new Promise((resolve, reject) => {
      // Open a network connection to the WebSocket server
      webSocket.on("open", async () => {
        try {
          await this.init(webSocket);
          resolve();
        } catch (ex) {
          reject(ex);
        }
      });
    });
  }

  /**
   * Closes the websocket connection.
   */
  close() {
    this._wsCall.close();
    if (this._server) {
      this._server.close();
    }
  }

  /**
   * Incoming calls.
   * Implements the wire protocol.
   *
   * @param method {string} the message name, e.g. "func", "get", etc.
   * @param listener {async function(payload {JSON}}
   * What the listener function returns is sent back as result to the caller.
   * If listener throws, sends the error message to the caller at the remote end.
   */
  registerIncomingCall(method, listener) {
    this._wsCall.register(method, listener);
  }

  /**
   * Outgoing calls.
   * Implements the wire protocol.
   *
   * @param method {string} the message name, e.g. "func", "get" etc.
   * @param payload {JSON} see value in PROTOCOL.md
   * @returns {any} see value in PROTOCOL.md
   *   The payload of the corresponding answer.
   * @throws {Error} if:
   *   - the remote end threw an exception
   *   - the connection disappeared
   */
  async callRemote(method, payload) {
    return await this._wsCall.makeCall(method, payload);
  }
}
