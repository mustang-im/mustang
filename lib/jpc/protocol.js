import BaseProtocol from "./obj.js";

/**
 * Wire protocol API
 */
export default class JPCProtocol extends BaseProtocol {
  /**
   * @param startObject {Object} Will be returned to client in "start" function
   */
  constructor(startObject) {
    super();
    this._startObject = startObject;
  }

  /**
   * Call this before calling any of the other functions.
   *
   * @param startObject {Object} Will be returned to client in "start" function
   */
  init() {
    this.start(this._startObject);
  }

  async getRemoteStartObject() {
    return await this.mapIncomingObjects(await this.callRemote("start"));
  }

  /**
   * Incoming calls.
   * Implements the wire protocol.
   *
   * @param method {string} the message name, e.g. "func", "get", "func-r" etc.
   * @param listener {async function(payload {JSON}}
   * What the listener function returns is sent back as result to the caller.
   * If listener throws, sends the error message to the caller at the remote end.
   */
  registerIncomingCall(method, listener) {
    throw new Error("Implement this");
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
    throw new Error("Implement this");
  }
}
