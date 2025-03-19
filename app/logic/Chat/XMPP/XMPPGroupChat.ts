import { XMPPChat } from "./XMPPChat";
import { Group } from "../../Abstract/Group";
import { appGlobal } from "../../app";

export class XMPPGroupChat extends XMPPChat {
  async init() {
    let nick = appGlobal.me.name ?? this.account.jid.split("@")[0];
    this.account.client.joinRoom(this.id, nick);
  }
  async listMembers() {
    // let config = await this.account.client.getRoomConfig(room);
    let membersResult = await this.account.client.getRoomMembers(this.id);
    let members = membersResult.muc.users || [];
    let persons = await Promise.all(members
      .filter(m => m.jid && m.jid != this.account.jid)
      .map(member => this.account.getPerson(member.jid, member.nick)));
    if (persons.length <= 1) { // 1:1 chat
      this.contact = persons[0];
    } else { // group chat
      let group = new Group()
      group.participants.addAll(persons);
      this.contact = group;
    }
    this.members.addAll(persons);
  }
}
