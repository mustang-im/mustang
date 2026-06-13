/** A WhatsApp JID (Jabber ID), e.g. `4915123@s.whatsapp.net`, a group
 * `12345-678@g.us`, or a specific device `4915123:3@s.whatsapp.net`. */
export class JID {
  user: string;
  server: string;
  /** Device id; 0 = the main device / the phone */
  device: number;

  constructor(user: string, server: string, device = 0) {
    this.user = user;
    this.server = server;
    this.device = device;
  }

  static parse(jid: string): JID {
    let atIndex = jid.indexOf("@");
    if (atIndex < 0) {
      return new JID("", jid, 0); // server-only JID, e.g. "s.whatsapp.net"
    }
    let server = jid.substring(atIndex + 1);
    let userPart = jid.substring(0, atIndex);
    let device = 0;
    let colonIndex = userPart.indexOf(":");
    if (colonIndex >= 0) {
      device = parseInt(userPart.substring(colonIndex + 1), 10) || 0;
      userPart = userPart.substring(0, colonIndex);
    }
    return new JID(userPart, server, device);
  }

  toString(): string {
    if (!this.user) {
      return this.server;
    }
    let user = this.device ? `${this.user}:${this.device}` : this.user;
    return `${user}@${this.server}`;
  }

  /** The same JID without a device (the user's main account address). */
  toNonDevice(): JID {
    return new JID(this.user, this.server, 0);
  }

  get isGroup(): boolean {
    return this.server == kServerGroup;
  }

  static agentForServer(server: string): number | undefined {
    return kAgentForServer[server];
  }

  static serverForAgent(agent: number): string {
    return kServerForAgent[agent] ?? kServerUser;
  }
}

export const kServerUser = "s.whatsapp.net";
export const kServerLid = "lid";
export const kServerGroup = "g.us";
export const kServerBroadcast = "broadcast";
export const kServerNewsletter = "newsletter";
export const kServerCall = "call";

/** Agent byte values used in the AD (agent+device) JID encoding. */
const kAgentForServer: Record<string, number> = {
  [kServerUser]: 0,
  [kServerLid]: 1,
};
const kServerForAgent: Record<number, string> = {
  0: kServerUser,
  1: kServerLid,
};
