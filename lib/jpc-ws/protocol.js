import WSCall from "./WSCall.js";
import JPCProtocol from "../jpc/protocol.js";
import WebSocketNode, { WebSocketServer } from "ws";
import { assert } from "../jpc/util.js";

/** @typedef {number} Integer */
/** @typedef {object} JSON */

/**
 * Wire protocol API
 */
export default class JPCWebSocket extends JPCProtocol {
  _wsCall = null;
  _server = null;
  _secret = null;
  _wantToClose = false;
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
   * @param secret {string} 32-char alphanumeric (and dashes allowed) passcode that the client must send to be able to connect
   * @param port {Integer} Between 1024 and 65535
   * @param openPublic {boolean} (optional, default false)
   *   If true, allow other computers from the network to connect.
   *   If false, allow only applications on the local host to connect.
   */
  async listen(secret, port, openPublic) {
    assert(secret && typeof (secret) == "string", "JPC server: Need a JPC secret");
    assert(secret.length >= 32, "JPC server: Need a JPC secret of >= 32 chars, but got " + secret);
    assert(typeof (port) == "number", "Need port");
    this._secret = secret;
    let host = openPublic ? '0.0.0.0' : '127.0.0.1'; // TODO IPv6

    this._server = new WebSocketServer({
      host: host,
      port: port,
      maxPayload: 0,
      verifyClient: (info, cb) => verifyClient(info, cb, "jpc-" + secret),
    });
    await new Promise(resolve => {
      this._server.on("listening", () => resolve());
    });
    console.log(`Listening JPC WebSocket on ${openPublic ? "all interfaces " : "localhost"}:${port}`);
    this._server.on("connection", webSocket => this.newConnection(webSocket));
    this._server.on("close", async () => {
      if (this._wantToClose) {
        return;
      }
      console.log("Re-opening backend JPC");
      await this.listen(secret, port, openPublic);
    });
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
      this._wantToClose = true;
      this._server.close();
    }
  }

  /**
   * Connects to a WebSocket server.
   *
   * @param secret {string} 32-char passcode that the client must send to be able to connect
   * @param hostname {string} Optional, default localhost
   * @param port {Integer} Between 1024 and 65535
   */
  async connect(secret, hostname, port) {
    assert(secret && typeof (secret) == "string", "JPC client: Need a JPC secret");
    assert(secret.length >= 32, "JPC client: Need a JPC secret of >= 32 chars, but got " + secret);
    assert(typeof (port) == "number", "Need port");
    assert(!hostname || typeof (hostname) == "string", "Invalid hostname");
    hostname = hostname || "localhost";

    let url = `ws://${hostname}:${port}`;
    let webSocket;
    let protocolStr = "jpc-" + secret;
    if (typeof WebSocket == "function") { // browser
      webSocket = new WebSocket(url, protocolStr);
      // @ts-ignore
      webSocket.on = (eventName, func) => {
        webSocket.addEventListener(eventName, message => func(message.data), false);
      };
    } else { // node.js
      webSocket = new WebSocketNode(url, protocolStr);
    }
    await new Promise((resolve, reject) => {
      // Wait to open a network connection to the WebSocket server
      const onOpen = () => {
        cleanup();
        resolve();
      };
      const onClose = event => {
        cleanup();
        reject(new Error(event.reason ?? 'JPC: Connection failed to open'));
      };
      const onError = event => {
        cleanup();
        reject(new Error('JPC: Connection failed to open'));
      };
      const cleanup = () => {
        webSocket.removeEventListener('open', onOpen);
        webSocket.removeEventListener('close', onClose);
        webSocket.removeEventListener('error', onError);
      };
      webSocket.addEventListener('open', onOpen);
      webSocket.addEventListener('close', onClose);
      webSocket.addEventListener('error', onError);
    });
    await this.init(webSocket);
    webSocket.on("close", async () => {
      try {
        if (this._wantToClose) {
          return;
        }
        console.log("Reconnecting to backend JPC");

        await this.connect(secret, hostname, port);
      } catch (ex) {
        console.error(ex);
      }
    });
  }

  /**
   * Closes the websocket connection.
   */
  close() {
    this._wantToClose = true;
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
   * @param listener {function(JSON): Promise<any>}
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
   * @param [payload] {JSON} see value in PROTOCOL.md
   * @returns {Promise<any>} see value in PROTOCOL.md
   *   The payload of the corresponding answer.
   * @throws {Error} if:
   *   - the remote end threw an exception
   *   - the connection disappeared
   */
  async callRemote(method, payload) {
    return await this._wsCall.makeCall(method, payload);
  }
}

function verifyClient(info, cb, protocolStr) {
  let origin = info.origin;
  const allowedOrigin =
    !origin || // Node client: no Origin header
    origin === "null" || // file:// pages in Chromium
    origin.startsWith("file://") || // Electron renderer in production
    origin === "http://localhost:5454" || // Vite renderer, prod
    origin === "http://localhost:5453" || // Vite renderer, dev
    origin === "https://localhost" || // Capacitor Android (default androidScheme=https)
    origin === "http://localhost" || // Capacitor Android (androidScheme=http)
    origin === "capacitor://localhost" || // Capacitor iOS (default iosScheme=capacitor)
    origin === "ionic://localhost"; // Capacitor iOS / Ionic (alt iosScheme=ionic)
  if (!allowedOrigin) {
    console.warn(`JPC: refused Origin ${origin}`);
    return cb(false, 403, "Forbidden");
  }
  if (info.req.headers["sec-websocket-protocol"] !== protocolStr) {
    console.warn(`JPC: Auth failed: Bad or missing secret.`);
    return cb(false, 403, "Forbidden");
  }
  cb(true);
}
