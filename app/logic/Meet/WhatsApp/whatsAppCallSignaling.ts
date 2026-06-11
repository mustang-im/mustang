/** Builds and parses WhatsApp `<call>` signaling stanzas for the WEB calling
 * profile (the way web.whatsapp.com places calls).
 *
 * Unlike the native Android/iOS clients (proprietary SDES-SRTP), the web client
 * runs in a browser and therefore uses standard WebRTC: DTLS-SRTP transport and
 * ICE. So the offer/answer carry a WebRTC **SDP** (which embeds the DTLS
 * fingerprint, ICE ufrag/pwd, and codecs) and ICE candidates trickle via a
 * `<transport>` action. An end-to-end frame-encryption key (for SFU group calls)
 * is carried in an `<enc>` node, Signal-encrypted (see WhatsAppCallE2E).
 *
 * WHAT IS ACCURATE vs. A GAP: the envelope (call/offer/accept/transport/
 * terminate, call-id, call-creator, the video flag, the enc key, and carrying
 * the WebRTC SDP+ICE) matches how a browser must work. The exact BYTE encoding
 * web.whatsapp.com uses to pack the SDP/fingerprint/ICE into the binary stanza
 * is new (2025) and undocumented; we carry the SDP in an `<sdp>` node, which
 * keeps the browser WebRTC code reusable. Matching the precise field layout
 * needs a live capture of web.whatsapp.com call traffic. */
import { WANode } from "../../Chat/WhatsApp/Binary/WANode";
import { JID } from "../../Chat/WhatsApp/Binary/JID";

export enum CallAction {
  Offer = "offer",
  Accept = "accept",
  Reject = "reject",
  Terminate = "terminate",
  Transport = "transport",
}

export interface CallSignal {
  action: CallAction;
  callID: string;
  /** JID of the call originator (the `call-creator` attribute). */
  callCreator?: string;
  /** The other party (the stanza `from`). */
  peer: JID;
  isVideo: boolean;
  isGroup: boolean;
  /** WebRTC session description (offer or answer). */
  sdp?: string;
  /** A trickled ICE candidate. */
  iceCandidate?: string;
  /** The end-to-end frame key, Signal-encrypted (offer only). */
  encKey?: Uint8Array;
  /** terminate reason, e.g. "timeout", "busy". */
  reason?: string;
}

/** Parses an incoming `<call>` stanza, or null if not a recognized action. */
export function parseCallStanza(node: WANode): CallSignal | null {
  if (node.tag != "call") {
    return null;
  }
  let from = node.jidAttr("from");
  if (!from) {
    return null;
  }
  for (let action of Object.values(CallAction)) {
    let child = node.child(action);
    if (!child) {
      continue;
    }
    return {
      action: action as CallAction,
      callID: child.attr("call-id") ?? "",
      callCreator: child.attr("call-creator"),
      peer: from,
      isVideo: !!child.child("video"),
      isGroup: !!child.attr("group-jid"),
      sdp: textOf(child.child("sdp")),
      iceCandidate: textOf(child.child("candidate")),
      encKey: child.child("enc")?.contentBytes ?? undefined,
      reason: child.attr("reason"),
    };
  }
  return null;
}

/** @param sdp the WebRTC offer SDP from RTCPeerConnection.
 *  @param encKey the E2E frame key, encrypted to the peer's Signal session. */
export function buildOffer(to: JID, ownJID: JID, callID: string, sdp: string, encKey: Uint8Array, isVideo: boolean): WANode {
  let children: WANode[] = [
    new WANode("enc", { v: "2", type: "pkmsg" }, encKey),
    sdpNode(sdp),
  ];
  if (isVideo) {
    children.push(new WANode("video", { enc: "vp8" }));
  }
  let offer = new WANode(CallAction.Offer, {
    "call-id": callID,
    "call-creator": ownJID.toString(),
  }, children);
  return callStanza(ownJID, to, callID, offer);
}

export function buildAccept(signal: CallSignal, ownJID: JID, sdp: string): WANode {
  let accept = new WANode(CallAction.Accept, {
    "call-id": signal.callID,
    "call-creator": signal.callCreator ?? signal.peer.toString(),
  }, [sdpNode(sdp)]);
  return callStanza(ownJID, signal.peer, signal.callID, accept);
}

export function buildICE(peer: JID, ownJID: JID, callID: string, candidate: string): WANode {
  let transport = new WANode(CallAction.Transport, { "call-id": callID }, [
    new WANode("candidate", {}, new TextEncoder().encode(candidate)),
  ]);
  return callStanza(ownJID, peer, callID, transport);
}

export function buildReject(signal: CallSignal, ownJID: JID): WANode {
  let reject = new WANode(CallAction.Reject, {
    "call-id": signal.callID,
    "call-creator": signal.callCreator ?? signal.peer.toString(),
    count: "0",
  });
  return callStanza(ownJID, signal.peer, signal.callID, reject);
}

export function buildTerminate(peer: JID, ownJID: JID, callID: string, reason = "hangup"): WANode {
  let terminate = new WANode(CallAction.Terminate, {
    "call-id": callID,
    "call-creator": ownJID.toString(),
    reason,
  });
  return callStanza(ownJID, peer, callID, terminate);
}

function callStanza(from: JID, to: JID, callID: string, child: WANode): WANode {
  return new WANode("call", {
    from: from.toNonDevice().toString(),
    to: to.toNonDevice().toString(),
    id: callID,
  }, [child]);
}

function sdpNode(sdp: string): WANode {
  return new WANode("sdp", {}, new TextEncoder().encode(sdp));
}

function textOf(node: WANode | undefined): string | undefined {
  let bytes = node?.contentBytes;
  if (bytes) {
    return new TextDecoder().decode(bytes);
  }
  return typeof node?.content == "string" ? node.content : undefined;
}
