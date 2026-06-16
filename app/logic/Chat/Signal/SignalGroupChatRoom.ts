/** A Signal group (GroupV2) conversation. Mirrors `WhatsAppGroupChat`. The group is
 * addressed by its 32-byte master key; messages carry a `groupV2` context and are
 * fanned out pairwise to every member (a recipient sees a normal Content with the
 * groupV2 context — correct + interoperable, Docs/04 §9). The zkgroup-authenticated
 * group-server operations (create/modify/admin) live in Groups/Group.ts. */
import { SignalChatRoom } from "./SignalChatRoom";
import type { Group } from "../../Abstract/Group";
import { ServiceId } from "./ServiceId";
import type { SignalGroup } from "./Groups/Group";
import type { DecryptedGroup } from "./Proto/groups";
import type { DataMessage } from "./Proto/signalService";

export class SignalGroupChatRoom extends SignalChatRoom {
  declare contact: Group;

  /** 32-byte GroupMasterKey — the group's wire identity (derives its params). */
  masterKey: Uint8Array | null = null;
  /** Current group revision we have applied. */
  revision = 0;
  /** 32-byte group identifier (from GroupSecretParams), for routing / TypingMessage. */
  groupId: Uint8Array | null = null;
  /** The zkgroup helper (decrypt + server ops), built once the master key is set. */
  group: SignalGroup | null = null;

  recipients(): ServiceId[] {
    return this.members.contents
      .map(m => m.serviceId)
      .filter((s): s is ServiceId => !!s && !(this.account.aci && s.equals(this.account.aci)));
  }

  protected groupContext(): DataMessage["groupV2"] {
    return this.masterKey ? { masterKey: this.masterKey, revision: this.revision } : undefined;
  }

  protected typingGroupId(): Uint8Array | undefined {
    return this.groupId ?? undefined;
  }

  /** Populate the room from a decrypted group state: title, revision, and the
   * members as SignalContacts (linked through the account's contact cache so live
   * and 1:1 chats share the same contact objects). */
  populate(decrypted: DecryptedGroup): void {
    this.revision = decrypted.revision ?? this.revision;
    if (decrypted.title) {
      this._name = decrypted.title;
      this.name = decrypted.title;
    }
    if (decrypted.description) {
      this.contact.description = decrypted.description;
    }
    let members = (decrypted.members ?? []).map(m => {
      let serviceId = ServiceId.aci(m.aciBytes!);
      let contact = this.account.getContact(serviceId);
      if (m.profileKey?.length && !contact.profileKey) {
        contact.profileKey = m.profileKey;
      }
      return contact;
    });
    this.members.replaceAll(members);
  }

  async listMembers(): Promise<void> {
    // Members come from the decrypted group state (populated by the account on
    // first sight / fetch). Nothing to do synchronously.
  }
}
