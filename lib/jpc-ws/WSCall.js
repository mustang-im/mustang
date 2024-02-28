import MessageCall from "../jpc/message.js";
import { assert } from "../jpc/util.js";

export default class WSCall extends MessageCall {
  /**
   * @param webSocket {WebSocket from ws}
   */
  constructor(webSocket) {
    assert(typeof (webSocket.on) == "function");
    super();
    this._webSocket = webSocket;
    webSocket.on("message", (message, isBinary) => {
      if (!isBinary) {
        message = message.toString();
      }
      this._incomingMessage(message)
    });
  }

  send(message) {
    this._webSocket.send(JSON.stringify(message));
  }

  close() {
    this._webSocket.close();
  }
}
