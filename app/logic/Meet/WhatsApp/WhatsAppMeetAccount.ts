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
    return jid ? JID.parse(jid) : new JID(appGlobal.me?.name ?? "me", "s.whatsapp.net");
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
   * IDENTITY NOTE: chat poses as the Android client; calls use the Web profile
   * (browser WebRTC). A single companion connection advertises ONE platform to
   * the server, so a clean "Android for chat, Web for calls" split is achieved
   * by running calls over a SEPARATE Web-profile companion session (a second
   * linked device), not by switching identity mid-connection. For now this
   * reuses the chat connection as a gated placeholder; the production design
   * gives the Meet account its own Web companion connection. */
  async sendCallStanza(node: WANode): Promise<void> {
    let connection = this.chatAccount?.connection;
    if (!connection) {
      throw new Error("WhatsApp is not connected");
    }
    await connection.sendNode(node);
  }
}
