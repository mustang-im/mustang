import MessageCall from "../jpc/message.js";
import { assert } from "../jpc/util.js";

export default class WSCall extends MessageCall {
  /**
   * @param webSocket {import("ws").WebSocket}
   */
  constructor(webSocket) {
    assert(typeof (webSocket.on) == "function");
    super();
    this._webSocket = webSocket;
    this._closed = false;
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
    // Without this, in-flight makeCall() promises stay pending forever
    // when the socket dies (Android suspends the app, Node-mobile is killed,
    // etc.), which strands any Lock the caller was holding.
    let onDisconnect = (reason) => {
      if (this._closed) {
        return;
      }
      this._closed = true;
      this._rejectAllPendingCalls(reason);
    };
    webSocket.on("close", () => onDisconnect("JPC WebSocket was closed"));
    webSocket.on("error", () => onDisconnect("JPC WebSocket error"));
  }

  send(message) {
    if (this._closed) {
      throw Object.assign(new Error("JPC WebSocket is closed"), { code: "ConnectionClosed" });
    }
    this._webSocket.send(JSON.stringify(message));
  }

  close() {
    this._webSocket.close();
  }
}
