import { XMPPChat } from "./XMPPChat";
import { Group } from "../../Abstract/Group";
import { appGlobal } from "../../app";

/** TODO Not wired up yet: List the bookmarked rooms (XEP-0402) and join them */
export class XMPPGroupChat extends XMPPChat {
  async init(): Promise<void> {
    let nick = appGlobal.me.name ?? this.account.jid.split("@")[0];
    await this.account.client.joinRoom(this.id, nick);
  }
  async listMembers(): Promise<void> {
    let membersResult = await this.account.client.getRoomMembers(this.id);
    let members = membersResult.muc.users ?? [];
    let persons = await Promise.all(members
      .filter(m => m.jid && m.jid != this.account.jid)
      .map(member => this.account.getPerson(member.jid, member.nick)));
    if (persons.length <= 1) { // 1:1 chat
      this.contact = persons[0] as any;
    } else { // group chat
      let group = new Group();
      group.participants.addAll(persons);
      this.contact = group;
    }
    this.members.replaceAll(persons as any);
  }
}
