/** Groups V2 client logic: decrypt a server `Group` into the local `DecryptedGroup`
 * view, and the zk-authenticated group-cloud operations (fetch / create / modify +
 * admin helpers). Built on the verified zkgroup crypto in Encryption/ZKGroup
 * (GroupSecretParams) and the protos in Proto/groups.ts. See Docs/04-groups-v2.
 *
 * Clean-room; mirrors Mail/ + the WhatsApp group structure. All field encryption
 * delegates to GroupSecretParams; the protobuf orchestration + endpoint shapes are
 * ours (the GroupsController is in a separate repo, so the wire format is
 * client-authoritative — see Docs/04 §0/§12). */
import { GroupSecretParams } from "../Encryption/ZKGroup/groupParams";
import { serializeCiphertext, parseCiphertext, type KvacCiphertext } from "../Encryption/ZKGroup/groupParams";
import { presentAuthCredential, type AuthCredentialPresentation } from "../Encryption/ZKGroup/presentation";
import type { AuthCredentialWithPni, ServerPublicParams } from "../Encryption/ZKGroup/credentials";
import { ServiceId } from "../ServiceId";
import { randomBytes } from "../Crypto/primitives";
import { encode, decode } from "../Proto/codec";
import {
  Group, GroupChange, GroupChangeActions, GroupResponse, GroupChangeResponse,
  GroupAttributeBlob, MemberRole, AccessRequired, EnabledState,
  DecryptedGroup, DecryptedMember,
  type Member, type DecryptedPendingMember, type DecryptedRequestingMember,
  type DecryptedBannedMember, type AccessControl as AccessControlT,
} from "../Proto/groups";
import { bytesToHex } from "@noble/curves/utils.js";
import type { SignalApi, Credentials } from "../Connection/SignalApi";

/** The two pieces a client needs to authenticate to the group cloud (Docs/04 §2):
 * a verified daily auth credential and the chat server's public params (to sign
 * the presentation). The account fetches + caches these. */
export interface GroupAuth {
  credential: AuthCredentialWithPni;
  serverPublicParams: ServerPublicParams;
}

/** A Signal group, addressed by its 32-byte master key. Derives the zkgroup params,
 * decrypts server state, and runs the group-cloud operations. */
export class SignalGroup {
  readonly params: GroupSecretParams;

  constructor(readonly masterKey: Uint8Array) {
    this.params = GroupSecretParams.deriveFromMasterKey(masterKey);
  }

  /** The 32-byte GroupIdentifier — the group's primary key / URL identity. */
  get groupId(): Uint8Array {
    return this.params.groupId;
  }

  // --- decrypt pipeline: Group → DecryptedGroup ---

  /** Decrypt a full server `Group` into the local plaintext view. */
  decryptGroup(group: Group): DecryptedGroup {
    let out: DecryptedGroup = {
      revision: group.version ?? 0,
      members: (group.members ?? []).map(m => this.decryptMember(m)),
      pendingMembers: (group.membersPendingProfileKey ?? []).map(m => this.decryptPendingMember(m)),
      requestingMembers: (group.membersPendingAdminApproval ?? []).map(m => this.decryptRequestingMember(m)),
      bannedMembers: (group.membersBanned ?? []).map(m => this.decryptBannedMember(m)),
      accessControl: this.copyAccessControl(group.accessControl),
      inviteLinkPassword: group.inviteLinkPassword,
      isAnnouncementGroup: group.announcementsOnly ? EnabledState.Enabled : EnabledState.Disabled,
      terminated: group.terminated,
    };
    if (group.title?.length) {
      out.title = this.decryptAttributeString(group.title, blob => blob.title);
    }
    if (group.description?.length) {
      out.description = this.decryptAttributeString(group.description, blob => blob.descriptionText);
    }
    if (group.disappearingMessagesTimer?.length) {
      let timer = this.decryptAttributeBlob(group.disappearingMessagesTimer);
      out.disappearingMessagesTimer = { duration: timer.disappearingMessagesDuration ?? 0 };
    }
    if (group.avatarUrl) {
      out.avatar = group.avatarUrl; // its content is decrypted lazily via the CDN
    }
    return out;
  }

  protected decryptMember(m: Member): DecryptedMember {
    let aci = this.requireServiceId(m.userId!, "member userId");
    let out: DecryptedMember = {
      aciBytes: aci.uuid,
      role: m.role ?? MemberRole.Default,
      joinedAtRevision: m.joinedAtVersion ?? 0,
    };
    if (m.profileKey?.length) {
      let pk = this.params.decryptProfileKey(parseCiphertext(m.profileKey), aci.uuid);
      if (pk) {
        out.profileKey = pk;
      }
    }
    if (m.labelEmoji?.length) {
      out.labelEmoji = new TextDecoder().decode(this.params.decryptBlob(m.labelEmoji));
    }
    if (m.labelString?.length) {
      out.labelString = new TextDecoder().decode(this.params.decryptBlob(m.labelString));
    }
    return out;
  }

  protected decryptPendingMember(m: NonNullable<Group["membersPendingProfileKey"]>[number]): DecryptedPendingMember {
    let inner = m.member;
    let sid = inner?.userId?.length ? this.requireServiceId(inner.userId, "pending member userId") : null;
    return {
      serviceIdBytes: sid?.serviceIdFixedWidthBinary(),
      serviceIdCipherText: inner?.userId,
      role: inner?.role ?? MemberRole.Default,
      addedByAci: m.addedByUserId?.length ? this.requireServiceId(m.addedByUserId, "addedBy").uuid : undefined,
      timestamp: m.timestamp,
    };
  }

  protected decryptRequestingMember(m: NonNullable<Group["membersPendingAdminApproval"]>[number]): DecryptedRequestingMember {
    let aci = this.requireServiceId(m.userId!, "requesting member userId");
    let out: DecryptedRequestingMember = { aciBytes: aci.uuid, timestamp: m.timestamp };
    if (m.profileKey?.length) {
      let pk = this.params.decryptProfileKey(parseCiphertext(m.profileKey), aci.uuid);
      if (pk) {
        out.profileKey = pk;
      }
    }
    return out;
  }

  protected decryptBannedMember(m: NonNullable<Group["membersBanned"]>[number]): DecryptedBannedMember {
    let sid = this.requireServiceId(m.userId!, "banned member userId");
    return { serviceIdBytes: sid.serviceIdFixedWidthBinary(), timestamp: m.timestamp };
  }

  protected copyAccessControl(ac: AccessControlT | undefined): AccessControlT | undefined {
    return ac; // not encrypted — copied as-is
  }

  protected decryptAttributeString(blob: Uint8Array, pick: (b: GroupAttributeBlob) => string | undefined): string {
    return pick(this.decryptAttributeBlob(blob)) ?? "";
  }

  protected decryptAttributeBlob(blob: Uint8Array): GroupAttributeBlob {
    return decode(GroupAttributeBlob, this.stripPadding(this.params.decryptBlob(blob)));
  }

  /** Some blobs are length-hidden with a 4-byte big-endian padding-length prefix
   * (`encrypt_blob_with_padding`); strip it when present. A bare blob has no prefix,
   * so only strip when the declared length fits. */
  protected stripPadding(plaintext: Uint8Array): Uint8Array {
    if (plaintext.length < 4) {
      return plaintext;
    }
    let len = (plaintext[0] << 24) | (plaintext[1] << 16) | (plaintext[2] << 8) | plaintext[3];
    if (len >= 0 && 4 + len <= plaintext.length) {
      return plaintext.subarray(4, 4 + len);
    }
    return plaintext;
  }

  protected requireServiceId(ciphertext: Uint8Array, what: string): ServiceId {
    let sid = this.params.decryptServiceId(parseCiphertext(ciphertext));
    if (!sid) {
      throw new Error(`Signal group: failed to decrypt ${what}`);
    }
    return sid;
  }

  // --- field encryption (for create / modify) ---

  encryptServiceId(serviceId: ServiceId): Uint8Array {
    return serializeCiphertext(this.params.encryptServiceId(serviceId));
  }

  encryptProfileKey(profileKey: Uint8Array, aciUuid: Uint8Array): Uint8Array {
    return serializeCiphertext(this.params.encryptProfileKey(profileKey, aciUuid));
  }

  encryptTitle(title: string): Uint8Array {
    return this.encryptBlob({ title });
  }

  encryptDescription(descriptionText: string): Uint8Array {
    return this.encryptBlob({ descriptionText });
  }

  encryptTimer(seconds: number): Uint8Array {
    return this.encryptBlob({ disappearingMessagesDuration: seconds });
  }

  protected encryptBlob(blob: GroupAttributeBlob): Uint8Array {
    return this.params.encryptBlob(encode(GroupAttributeBlob, blob), randomBytes(32));
  }

  // --- zk auth header ---

  /** The group-cloud Basic-auth credentials (Docs/04 §2.3): username =
   * hex(GroupPublicParams), password = hex(AuthCredentialPresentation). Anonymous —
   * no per-account secret. SignalApi wraps these in `Authorization: Basic …`. */
  authCreds(auth: GroupAuth): Credentials {
    let presentation: AuthCredentialPresentation = presentAuthCredential(
      auth.credential,
      auth.serverPublicParams.genericCredentialPublicKey,
      this.params,
      randomBytes(32));
    return {
      username: bytesToHex(this.params.getPublicParams().serialize()),
      password: bytesToHex(presentation.serialize()),
    };
  }

  // --- group-cloud operations ---

  /** Fetch the current group state: GET /v2/groups (Docs/04 §3). */
  async fetch(api: SignalApi, auth: GroupAuth): Promise<DecryptedGroup> {
    let body = await api.getBytes("/v2/groups/", this.authCreds(auth));
    let response = decode(GroupResponse, body);
    if (!response.group) {
      throw new Error("Signal group: empty GroupResponse");
    }
    return this.decryptGroup(response.group);
  }

  /** Create a new group: PUT /v2/groups with the full version-0 state (Docs/04 §10).
   * Self is added as ADMINISTRATOR; other members are added by their profile-key
   * credential presentation (server derives the encrypted userId/profileKey). 409 =
   * already exists. Returns the decrypted created group. */
  async create(api: SignalApi, auth: GroupAuth, init: GroupCreate): Promise<DecryptedGroup> {
    let group: Group = {
      publicKey: this.params.getPublicParams().serialize(),
      version: 0,
      title: this.encryptTitle(init.title),
      accessControl: {
        attributes: AccessRequired.Member,
        members: AccessRequired.Member,
        addFromInviteLink: AccessRequired.Unsatisfiable,
        memberLabel: AccessRequired.Member,
      },
      members: init.members.map(m => ({ role: m.role ?? MemberRole.Default, presentation: m.presentation })),
    };
    if (init.timerSeconds) {
      group.disappearingMessagesTimer = this.encryptTimer(init.timerSeconds);
    }
    let body = await api.bytes("PUT", "/v2/groups/", encode(Group, group),
      "application/x-protobuf", this.authCreds(auth));
    return this.decryptGroup(decode(GroupResponse, body).group!);
  }

  /** Submit a GroupChange.Actions: PATCH /v2/groups; the server signs + applies it
   * and returns the signed GroupChange (Docs/04 §10). Returns the decoded actions
   * the server applied (the inline `groupChange` to rebroadcast via GroupContextV2). */
  async modify(api: SignalApi, auth: GroupAuth, actions: GroupChangeActions): Promise<AppliedChange> {
    let body = await api.bytes("PATCH", "/v2/groups/", encode(GroupChangeActions, actions),
      "application/x-protobuf", this.authCreds(auth));
    let response = decode(GroupChangeResponse, body);
    let change = response.groupChange;
    if (!change?.actions) {
      throw new Error("Signal group: PATCH returned no GroupChange");
    }
    return { groupChange: change, actions: decode(GroupChangeActions, change.actions) };
  }

  // --- admin helpers (build the Actions, then modify()) ---

  /** Add members by their profile-key credential presentation. */
  async addMembers(api: SignalApi, auth: GroupAuth, revision: number, members: NewMember[]): Promise<AppliedChange> {
    return this.modify(api, auth, {
      version: revision + 1,
      addMembers: members.map(m => ({ added: { role: m.role ?? MemberRole.Default, presentation: m.presentation } })),
    });
  }

  async removeMembers(api: SignalApi, auth: GroupAuth, revision: number, members: ServiceId[]): Promise<AppliedChange> {
    return this.modify(api, auth, {
      version: revision + 1,
      deleteMembers: members.map(s => ({ deletedUserId: this.encryptServiceId(s) })),
    });
  }

  async modifyRole(api: SignalApi, auth: GroupAuth, revision: number, member: ServiceId, role: MemberRole): Promise<AppliedChange> {
    return this.modify(api, auth, {
      version: revision + 1,
      modifyMemberRoles: [{ userId: this.encryptServiceId(member), role }],
    });
  }

  async modifyTitle(api: SignalApi, auth: GroupAuth, revision: number, title: string): Promise<AppliedChange> {
    return this.modify(api, auth, { version: revision + 1, modifyTitle: { title: this.encryptTitle(title) } });
  }

  async modifyTimer(api: SignalApi, auth: GroupAuth, revision: number, seconds: number): Promise<AppliedChange> {
    return this.modify(api, auth, {
      version: revision + 1,
      modifyDisappearingMessageTimer: { timer: this.encryptTimer(seconds) },
    });
  }

  /** Set a random invite-link password + open the link (admin). */
  async modifyInviteLink(api: SignalApi, auth: GroupAuth, revision: number, access: AccessRequired): Promise<AppliedChange> {
    return this.modify(api, auth, {
      version: revision + 1,
      modifyInviteLinkPassword: { inviteLinkPassword: randomBytes(16) },
      modifyAddFromInviteLinkAccess: { addFromInviteLinkAccess: access },
    });
  }
}

/** A member to add, identified by their zkgroup profile-key credential presentation
 * (the server derives the encrypted userId + profileKey from it). */
export interface NewMember {
  presentation: Uint8Array;
  role?: MemberRole;
}

export interface GroupCreate {
  title: string;
  members: NewMember[];
  timerSeconds?: number;
}

/** A server-signed change the client can apply locally + rebroadcast inline. */
export interface AppliedChange {
  groupChange: GroupChange;        // the full signed change (for GroupContextV2.groupChange)
  actions: GroupChangeActions;     // its decoded actions
}

export type { KvacCiphertext };
