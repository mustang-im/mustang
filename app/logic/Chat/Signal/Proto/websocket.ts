/** The chat-service WebSocket framing (WebSocketResources.proto). Signal tunnels
 * its REST API over a single WebSocket: each frame is a WebSocketMessage that is
 * either a REQUEST or a RESPONSE, correlated by `id`. See Docs/01-transport. */
import { message, string, bytes, int, sub, repeated, type TypeOf } from "./codec";

export enum WebSocketMessageType {
  Unknown = 0,
  Request = 1,
  Response = 2,
}

export const WebSocketRequestMessage = message({
  verb: string(1),
  path: string(2),
  body: bytes(3),
  headers: repeated(string(5)),
  id: int(4),
});
export type WebSocketRequestMessage = TypeOf<typeof WebSocketRequestMessage>;

export const WebSocketResponseMessage = message({
  id: int(1),
  status: int(2),
  message: string(3),
  headers: repeated(string(5)),
  body: bytes(4),
});
export type WebSocketResponseMessage = TypeOf<typeof WebSocketResponseMessage>;

export const WebSocketMessage = message({
  type: int(1),
  request: sub(2, () => WebSocketRequestMessage),
  response: sub(3, () => WebSocketResponseMessage),
});
export type WebSocketMessage = TypeOf<typeof WebSocketMessage>;
