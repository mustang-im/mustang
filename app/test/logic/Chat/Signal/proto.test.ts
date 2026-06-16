import { encode, decode } from "../../../../logic/Chat/Signal/Proto/codec";
import {
  Content, DataMessage, Envelope, EnvelopeType, ReceiptMessage, ReceiptType,
} from "../../../../logic/Chat/Signal/Proto/signalService";
import { WebSocketMessage, WebSocketMessageType } from "../../../../logic/Chat/Signal/Proto/websocket";
import { expect, test } from "vitest";

test("Content/DataMessage round-trips with nested + repeated + reaction + attachment", () => {
  let content: Content = {
    dataMessage: {
      body: "hello signal 👋",
      timestamp: 1_718_000_000_000,
      expireTimer: 86400,
      attachments: [{ cdnKey: "abc", cdnNumber: 3, contentType: "image/jpeg", size: 5000, cdnId: 0n }],
      reaction: { emoji: "❤️", remove: false, targetAuthorAci: "aci-1", targetSentTimestamp: 1_717_000_000_000 },
      quote: { id: 1_717_000_000_000, authorAci: "aci-1", text: "earlier" },
      bodyRanges: [{ start: 0, length: 5, style: 1 }],
    },
  };
  let back = decode(Content, encode(Content, content));
  expect(back.dataMessage!.body).toBe("hello signal 👋");
  expect(back.dataMessage!.timestamp).toBe(1_718_000_000_000);
  expect(back.dataMessage!.attachments![0].contentType).toBe("image/jpeg");
  expect(back.dataMessage!.attachments![0].cdnKey).toBe("abc");
  expect(back.dataMessage!.reaction!.emoji).toBe("❤️");
  expect(back.dataMessage!.quote!.text).toBe("earlier");
  expect(back.dataMessage!.bodyRanges![0].length).toBe(5);
});

test("ReceiptMessage round-trips a repeated uint64 timestamp list", () => {
  let receipt: ReceiptMessage = { type: ReceiptType.Read, timestamp: [111, 222, 333] };
  let back = decode(ReceiptMessage, encode(ReceiptMessage, receipt));
  expect(back.type).toBe(ReceiptType.Read);
  expect(back.timestamp).toEqual([111, 222, 333]);
});

test("Envelope round-trips (the outer plaintext frame)", () => {
  let env: Envelope = {
    type: EnvelopeType.UnidentifiedSender,
    destinationServiceId: "dest-aci",
    serverTimestamp: 1_718_000_000_001,
    content: new Uint8Array([1, 2, 3, 4]),
    urgent: true,
  };
  let back = decode(Envelope, encode(Envelope, env));
  expect(back.type).toBe(EnvelopeType.UnidentifiedSender);
  expect(back.destinationServiceId).toBe("dest-aci");
  expect(back.urgent).toBe(true);
  expect([...back.content!]).toEqual([1, 2, 3, 4]);
});

test("WebSocketMessage REQUEST round-trips (the transport frame)", () => {
  let inner = encode(DataMessage, { body: "x" });
  let msg: WebSocketMessage = {
    type: WebSocketMessageType.Request,
    request: { verb: "PUT", path: "/v1/messages/aci", body: inner, headers: ["content-type:application/json"], id: 7 },
  };
  let back = decode(WebSocketMessage, encode(WebSocketMessage, msg));
  expect(back.type).toBe(WebSocketMessageType.Request);
  expect(back.request!.verb).toBe("PUT");
  expect(back.request!.path).toBe("/v1/messages/aci");
  expect(back.request!.id).toBe(7);
  expect(decode(DataMessage, back.request!.body!).body).toBe("x");
});
