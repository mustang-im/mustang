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
    webSocket.on("message", async (message, isBinary) => {
      try {
        if (!isBinary) {
          message = message.toString();
        }
        await this._incomingMessage(message)
      } catch (ex) {
        // Should be caught in Message._incomingMessage (line 102, but sometimes isn't)
        console.error("last catch");
        console.error(ex);
      }
    });
  }

  send(message) {
    this._webSocket.send(JSON.stringify(message));
  }

  close() {
    this._webSocket.close();
  }
}
