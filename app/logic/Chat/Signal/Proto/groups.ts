/** The Groups V2 wire schema (`Groups.proto`) and the client-side decrypted view
 * (`DecryptedGroups.proto`), ported to our codec DSL. Field numbers are
 * authoritative — see Docs/04-groups-v2.
 *
 * The encrypted `Group` / `GroupChange` types are what the group cloud stores and
 * serves; every `bytes` "enc" field is a zkgroup ciphertext (UID/profile-key) or an
 * AES-256-GCM-SIV `GroupAttributeBlob`. The `Decrypted*` types are the local
 * plaintext a client builds after decrypting (Groups/Group.ts).
 *
 * `oneof`s are flattened: each member is its own optional field and the codec only
 * emits the one that is set (mirrors signalService.ts). uint64 timestamps decode as
 * JS numbers (exact for ms-since-epoch). */
import { message, string, bytes, int, int64, bool, sub, repeated, type TypeOf } from "./codec";

// --- enums (values authoritative; fields use int()) ---

export enum MemberRole { Unknown = 0, Default = 1, Administrator = 2 }
export enum AccessRequired { Unknown = 0, Any = 1, Member = 2, Administrator = 3, Unsatisfiable = 4 }
export enum EnabledState { Unknown = 0, Enabled = 1, Disabled = 2 }

// --- encrypted (wire) types ---

export const AccessControl = message({
  attributes: int(1),         // AccessRequired
  members: int(2),
  addFromInviteLink: int(3),
  memberLabel: int(4),
});
export type AccessControl = TypeOf<typeof AccessControl>;

export const Member = message({
  userId: bytes(1),           // enc ACI (UuidCiphertext, 65 B)
  role: int(2),               // MemberRole
  profileKey: bytes(3),       // enc profile key (ProfileKeyCiphertext, 65 B)
  presentation: bytes(4),     // ProfileKeyCredentialPresentation (set on add)
  joinedAtVersion: int(5),
  labelEmoji: bytes(6),       // enc UTF-8
  labelString: bytes(7),      // enc UTF-8
});
export type Member = TypeOf<typeof Member>;

export const MemberPendingProfileKey = message({   // invited member
  member: sub(1, () => Member),
  addedByUserId: bytes(2),    // enc ACI of inviter
  timestamp: int64(3),        // ms since epoch
});
export type MemberPendingProfileKey = TypeOf<typeof MemberPendingProfileKey>;

export const MemberPendingAdminApproval = message({ // join request
  userId: bytes(1),
  profileKey: bytes(2),
  presentation: bytes(3),
  timestamp: int64(4),
});
export type MemberPendingAdminApproval = TypeOf<typeof MemberPendingAdminApproval>;

export const MemberBanned = message({
  userId: bytes(1),
  timestamp: int64(2),
});
export type MemberBanned = TypeOf<typeof MemberBanned>;

export const Group = message({
  publicKey: bytes(1),        // serialized GroupPublicParams (97 B)
  title: bytes(2),            // enc GroupAttributeBlob{title}
  avatarUrl: string(3),       // CDN key; content = enc GroupAttributeBlob{avatar}
  disappearingMessagesTimer: bytes(4), // enc GroupAttributeBlob{disappearingMessagesDuration}
  accessControl: sub(5, () => AccessControl),
  version: int(6),            // == revision
  members: repeated(sub(7, () => Member)),
  membersPendingProfileKey: repeated(sub(8, () => MemberPendingProfileKey)),
  membersPendingAdminApproval: repeated(sub(9, () => MemberPendingAdminApproval)),
  inviteLinkPassword: bytes(10),
  description: bytes(11),     // enc GroupAttributeBlob{descriptionText}
  announcementsOnly: bool(12),
  membersBanned: repeated(sub(13, () => MemberBanned)),
  terminated: bool(14),
});
export type Group = TypeOf<typeof Group>;

/** The plaintext blob AES-256-GCM-SIV-encrypted into Group.title etc. (oneof). */
export const GroupAttributeBlob = message({
  title: string(1),
  avatar: bytes(2),
  disappearingMessagesDuration: int(3),
  descriptionText: string(4),
});
export type GroupAttributeBlob = TypeOf<typeof GroupAttributeBlob>;

export const GroupInviteLinkContentsV1 = message({
  groupMasterKey: bytes(1),
  inviteLinkPassword: bytes(2),
});
export type GroupInviteLinkContentsV1 = TypeOf<typeof GroupInviteLinkContentsV1>;

export const GroupInviteLink = message({   // oneof contents
  contentsV1: sub(1, () => GroupInviteLinkContentsV1),
});
export type GroupInviteLink = TypeOf<typeof GroupInviteLink>;

export const GroupJoinInfo = message({     // link preview
  publicKey: bytes(1),
  title: bytes(2),
  avatar: string(3),
  memberCount: int(4),
  addFromInviteLink: int(5), // AccessRequired
  version: int(6),
  pendingAdminApproval: bool(7),
  description: bytes(8),
});
export type GroupJoinInfo = TypeOf<typeof GroupJoinInfo>;

// --- GroupChange.Actions (every action type) ---

export const AddMemberAction = message({
  added: sub(1, () => Member),
  joinFromInviteLink: bool(2),
});
export const DeleteMemberAction = message({ deletedUserId: bytes(1) });
export const ModifyMemberRoleAction = message({ userId: bytes(1), role: int(2) });
export const ModifyMemberLabelAction = message({ userId: bytes(1), labelEmoji: bytes(2), labelString: bytes(3) });
export const ModifyMemberProfileKeyAction = message({ presentation: bytes(1), userId: bytes(2), profileKey: bytes(3) });
export const AddMemberPendingProfileKeyAction = message({ added: sub(1, () => MemberPendingProfileKey) });
export const DeleteMemberPendingProfileKeyAction = message({ deletedUserId: bytes(1) });
export const PromoteMemberPendingProfileKeyAction = message({ presentation: bytes(1), userId: bytes(2), profileKey: bytes(3) });
export const PromoteMemberPendingPniAciProfileKeyAction = message({ presentation: bytes(1), userId: bytes(2), pni: bytes(3), profileKey: bytes(4) });
export const AddMemberPendingAdminApprovalAction = message({ added: sub(1, () => MemberPendingAdminApproval) });
export const DeleteMemberPendingAdminApprovalAction = message({ deletedUserId: bytes(1) });
export const PromoteMemberPendingAdminApprovalAction = message({ userId: bytes(1), role: int(2) });
export const AddMemberBannedAction = message({ added: sub(1, () => MemberBanned) });
export const DeleteMemberBannedAction = message({ deletedUserId: bytes(1) });
export const ModifyTitleAction = message({ title: bytes(1) });
export const ModifyDescriptionAction = message({ description: bytes(1) });
export const ModifyAvatarAction = message({ avatar: string(1) });
export const ModifyDisappearingMessageTimerAction = message({ timer: bytes(1) });
export const ModifyAttributesAccessControlAction = message({ attributesAccess: int(1) });
export const ModifyMembersAccessControlAction = message({ membersAccess: int(1) });
export const ModifyAddFromInviteLinkAccessControlAction = message({ addFromInviteLinkAccess: int(1) });
export const ModifyMemberLabelAccessControlAction = message({ memberLabelAccess: int(1) });
export const ModifyInviteLinkPasswordAction = message({ inviteLinkPassword: bytes(1) });
export const ModifyAnnouncementsOnlyAction = message({ announcementsOnly: bool(1) });
export const TerminateGroupAction = message({});

export const GroupChangeActions = message({
  sourceUserId: bytes(1),     // enc ACI of editor (server-provided)
  version: int(2),            // target revision
  addMembers: repeated(sub(3, () => AddMemberAction)),
  deleteMembers: repeated(sub(4, () => DeleteMemberAction)),
  modifyMemberRoles: repeated(sub(5, () => ModifyMemberRoleAction)),
  modifyMemberProfileKeys: repeated(sub(6, () => ModifyMemberProfileKeyAction)),
  addMembersPendingProfileKey: repeated(sub(7, () => AddMemberPendingProfileKeyAction)),
  deleteMembersPendingProfileKey: repeated(sub(8, () => DeleteMemberPendingProfileKeyAction)),
  promoteMembersPendingProfileKey: repeated(sub(9, () => PromoteMemberPendingProfileKeyAction)),
  modifyTitle: sub(10, () => ModifyTitleAction),
  modifyAvatar: sub(11, () => ModifyAvatarAction),
  modifyDisappearingMessageTimer: sub(12, () => ModifyDisappearingMessageTimerAction),
  modifyAttributesAccess: sub(13, () => ModifyAttributesAccessControlAction),
  modifyMemberAccess: sub(14, () => ModifyMembersAccessControlAction),
  modifyAddFromInviteLinkAccess: sub(15, () => ModifyAddFromInviteLinkAccessControlAction),
  addMembersPendingAdminApproval: repeated(sub(16, () => AddMemberPendingAdminApprovalAction)),
  deleteMembersPendingAdminApproval: repeated(sub(17, () => DeleteMemberPendingAdminApprovalAction)),
  promoteMembersPendingAdminApproval: repeated(sub(18, () => PromoteMemberPendingAdminApprovalAction)),
  modifyInviteLinkPassword: sub(19, () => ModifyInviteLinkPasswordAction),
  modifyDescription: sub(20, () => ModifyDescriptionAction),
  modifyAnnouncementsOnly: sub(21, () => ModifyAnnouncementsOnlyAction),
  addMembersBanned: repeated(sub(22, () => AddMemberBannedAction)),
  deleteMembersBanned: repeated(sub(23, () => DeleteMemberBannedAction)),
  promoteMembersPendingPniAciProfileKey: repeated(sub(24, () => PromoteMemberPendingPniAciProfileKeyAction)),
  // field 25 = group_id, server-only; client MUST NOT set it.
  modifyMemberLabels: repeated(sub(26, () => ModifyMemberLabelAction)),
  modifyMemberLabelAccess: sub(27, () => ModifyMemberLabelAccessControlAction),
  terminateGroup: sub(28, () => TerminateGroupAction),
});
export type GroupChangeActions = TypeOf<typeof GroupChangeActions>;

export const GroupChange = message({
  actions: bytes(1),          // serialized GroupChangeActions (signed bytes)
  serverSignature: bytes(2),  // server NotarySignature over `actions`
  changeEpoch: int(3),
});
export type GroupChange = TypeOf<typeof GroupChange>;

// --- API response wrappers ---

export const AvatarUploadAttributes = message({
  key: string(1), credential: string(2), acl: string(3), algorithm: string(4),
  date: string(5), policy: string(6), signature: string(7),
});
export type AvatarUploadAttributes = TypeOf<typeof AvatarUploadAttributes>;

export const ExternalGroupCredential = message({ token: string(1) });

export const GroupResponse = message({
  group: sub(1, () => Group),
  groupSendEndorsementsResponse: bytes(2),
});
export type GroupResponse = TypeOf<typeof GroupResponse>;

export const GroupChangeState = message({
  groupChange: sub(1, () => GroupChange),
  groupState: sub(2, () => Group),
});

export const GroupChanges = message({
  groupChanges: repeated(sub(1, () => GroupChangeState)),
  groupSendEndorsementsResponse: bytes(2),
});
export type GroupChanges = TypeOf<typeof GroupChanges>;

export const GroupChangeResponse = message({
  groupChange: sub(1, () => GroupChange),
  groupSendEndorsementsResponse: bytes(2),
});
export type GroupChangeResponse = TypeOf<typeof GroupChangeResponse>;

// --- decrypted (local) view (DecryptedGroups.proto) ---

export const DecryptedMember = message({
  aciBytes: bytes(1),
  role: int(2),               // MemberRole
  profileKey: bytes(3),
  joinedAtRevision: int(5),
  pniBytes: bytes(6),
  labelEmoji: string(7),
  labelString: string(8),
});
export type DecryptedMember = TypeOf<typeof DecryptedMember>;

export const DecryptedPendingMember = message({
  serviceIdBytes: bytes(1),
  role: int(2),
  addedByAci: bytes(3),
  timestamp: int64(4),
  serviceIdCipherText: bytes(5),
});
export type DecryptedPendingMember = TypeOf<typeof DecryptedPendingMember>;

export const DecryptedRequestingMember = message({
  aciBytes: bytes(1),
  profileKey: bytes(2),
  timestamp: int64(4),
});
export type DecryptedRequestingMember = TypeOf<typeof DecryptedRequestingMember>;

export const DecryptedBannedMember = message({
  serviceIdBytes: bytes(1),
  timestamp: int64(2),
});
export type DecryptedBannedMember = TypeOf<typeof DecryptedBannedMember>;

export const DecryptedPendingMemberRemoval = message({
  serviceIdBytes: bytes(1),
  serviceIdCipherText: bytes(2),
});

export const DecryptedApproveMember = message({ aciBytes: bytes(1), role: int(2) });
export const DecryptedModifyMemberRole = message({ aciBytes: bytes(1), role: int(2) });
export const DecryptedModifyMemberLabel = message({ aciBytes: bytes(1), labelEmoji: string(2), labelString: string(3) });
export const DecryptedString = message({ value: string(1) });
export const DecryptedTimer = message({ duration: int(1) });

export const DecryptedGroup = message({
  title: string(2),
  avatar: string(3),
  disappearingMessagesTimer: sub(4, () => DecryptedTimer),
  accessControl: sub(5, () => AccessControl),
  revision: int(6),
  members: repeated(sub(7, () => DecryptedMember)),
  pendingMembers: repeated(sub(8, () => DecryptedPendingMember)),
  requestingMembers: repeated(sub(9, () => DecryptedRequestingMember)),
  inviteLinkPassword: bytes(10),
  description: string(11),
  isAnnouncementGroup: int(12), // EnabledState
  bannedMembers: repeated(sub(13, () => DecryptedBannedMember)),
  terminated: bool(14),
  isPlaceholderGroup: bool(64), // local-only sentinel
});
export type DecryptedGroup = TypeOf<typeof DecryptedGroup>;

export const DecryptedGroupChange = message({
  editorServiceIdBytes: bytes(1),
  revision: int(2),
  newMembers: repeated(sub(3, () => DecryptedMember)),
  deleteMembers: repeated(bytes(4)),
  modifyMemberRoles: repeated(sub(5, () => DecryptedModifyMemberRole)),
  modifiedProfileKeys: repeated(sub(6, () => DecryptedMember)),
  newPendingMembers: repeated(sub(7, () => DecryptedPendingMember)),
  deletePendingMembers: repeated(sub(8, () => DecryptedPendingMemberRemoval)),
  promotePendingMembers: repeated(sub(9, () => DecryptedMember)),
  newTitle: sub(10, () => DecryptedString),
  newAvatar: sub(11, () => DecryptedString),
  newTimer: sub(12, () => DecryptedTimer),
  newAttributeAccess: int(13),
  newMemberAccess: int(14),
  newInviteLinkAccess: int(15),
  newRequestingMembers: repeated(sub(16, () => DecryptedRequestingMember)),
  deleteRequestingMembers: repeated(bytes(17)),
  promoteRequestingMembers: repeated(sub(18, () => DecryptedApproveMember)),
  newInviteLinkPassword: bytes(19),
  newDescription: sub(20, () => DecryptedString),
  newIsAnnouncementGroup: int(21),
  newBannedMembers: repeated(sub(22, () => DecryptedBannedMember)),
  deleteBannedMembers: repeated(sub(23, () => DecryptedBannedMember)),
  promotePendingPniAciMembers: repeated(sub(24, () => DecryptedMember)),
  modifyMemberLabels: repeated(sub(26, () => DecryptedModifyMemberLabel)),
  newMemberLabelAccess: int(27),
  terminateGroup: bool(28),
});
export type DecryptedGroupChange = TypeOf<typeof DecryptedGroupChange>;

export const DecryptedGroupJoinInfo = message({
  title: string(2),
  avatar: string(3),
  memberCount: int(4),
  addFromInviteLink: int(5),
  revision: int(6),
  pendingAdminApproval: bool(7),
  description: string(8),
  isAnnouncementGroup: bool(9),
});
export type DecryptedGroupJoinInfo = TypeOf<typeof DecryptedGroupJoinInfo>;
