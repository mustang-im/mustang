/** A Meet account for WhatsApp voice/video calls. It is a thin dependent account
 * of the WhatsAppAccount (the chat account) — it has no connection of its own;
 * call signaling rides over the chat account's live connection.
 *
 * GATED: calls only work once the WhatsApp live connection is enabled and the
 * media plane is completed (see WhatsAppCall). */
import { MeetAccount } from "../MeetAccount";
import { WhatsAppCall } from "./WhatsAppCall";
import { parseCallStanza, CallAction } from "./whatsAppCallSignaling";
import { JID } from "../../Chat/WhatsApp/Binary/JID";
import type { WANode } from "../../Chat/WhatsApp/Binary/WANode";
import type { WhatsAppAccount } from "../../Chat/WhatsApp/WhatsAppAccount";
import { appGlobal } from "../../app";

export class WhatsAppMeetAccount extends MeetAccount {
  readonly protocol: string = "whatsapp-meet";
  canAudio = true;
  canVideo = true;
  canScreenShare = false;
  canMultipleParticipants = false; // 1:1 calls for now; WhatsApp also has group calls
  canCreateURL = false;

  /** The chat account that owns the connection used for signaling.
   * Derived from `mainAccount`, so a startup-loaded account is wired by the
   * standard dependent-account linking (Account.setMainAccounts). */
  get chatAccount(): WhatsAppAccount {
    return this.mainAccount as WhatsAppAccount;
  }

  newMeeting(): WhatsAppCall {
    return new WhatsAppCall(this);
  }

  // Dependent account: no own login or license; it uses the chat account.
  needsLicense(): boolean {
    return false;
  }
  async login(): Promise<void> {
  }

  /** Our user's own JID, learned from the paired chat account. */
  get ownJID(): JID {
    let jid = this.chatAccount?.username;
    if (!jid) {
      throw new Error("WhatsApp account is not paired yet"); // never fabricate a JID from a display name
    }
    return JID.parse(jid);
  }

  /** Routes an incoming `<call>` stanza to the right call, or starts a new one. */
  handleCallStanza(node: WANode): void {
    let signal = parseCallStanza(node);
    if (!signal) {
      return;
    }
    let existing = appGlobal.meetings.find(
      m => m instanceof WhatsAppCall && m.callID == signal.callID) as WhatsAppCall | undefined;
    if (existing) {
      existing.onSignal(signal).catch(ex => this.errorCallback(ex));
      return;
    }
    if (signal.action == CallAction.Offer) {
      let call = this.newMeeting();
      call.onIncomingOffer(signal);
      appGlobal.meetings.add(call);
    }
  }

  /** Sends a call stanza over the WhatsApp connection.
   *
   * MEDIA-PLANE NOTE: WhatsApp calls — on Android AND on web.whatsapp.com — do
   * not use a browser's standard WebRTC (SDP / DTLS-SRTP / ICE). The media plane
   * is proprietary: an SRTP master secret is Signal-encrypted to each device in
   * the call offer (SDES-style keying) and carried over WhatsApp's own relays;
   * the WABinary token dictionary has no sdp/ice/dtls vocabulary at all. So the
   * RTCPeerConnection path in WhatsAppCall is a stand-in, not a compatible
   * implementation, and reusing a separate Web-profile companion would not change
   * that. The `<call>` signaling envelope below (call-id/call-creator/offer/
   * accept/terminate) is correct; the media descriptors it carries are the gap.
   * This rides the chat connection as a gated placeholder. */
  async sendCallStanza(node: WANode): Promise<void> {
    let connection = this.chatAccount?.connection;
    if (!connection) {
      throw new Error("WhatsApp is not connected");
    }
    await connection.sendNode(node);
  }
}
