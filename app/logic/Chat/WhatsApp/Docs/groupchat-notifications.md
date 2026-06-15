# Group chat notifications and receiving messages

WhatsApp Android wire protocol for incoming `<notification type="w:gp2">`
group-change stanzas, the ack, and the group message receive + receipt path.

## 1. The `<notification type="w:gp2">` stanza

A `w:gp2` notification carries one or more action child elements; the
notification-level attributes say who/when, the children say what changed.

Notification attributes:

| attr | meaning |
|---|---|
| `from` | the group JID |
| `type` | `"w:gp2"` |
| `participant` / `participant_pn` | the actor (and its phone form when LID) |
| `id` | notification id (echoed in the ack) |
| `t` | unix timestamp |
| `notify` | actor push-name, or `"invite"` when joined via link |
| `addressing_mode` | `"lid"` / `"pn"` |

Action children:

| child | meaning | key attrs / children |
|---|---|---|
| `add` | members joined/added | `<participant jid= [phone_number=] [lid=] [error=]>`; `v_id`, `prev_v_id` |
| `remove` | members left/removed | `<participant jid=…>`; `v_id`, `prev_v_id` |
| `promote` / `demote` | admin status changed | `<participant jid=…>` |
| `subject` | name changed | `subject`, `s_t`, `s_o`, `s_o_pn` |
| `description` | topic changed | `id`; `<body>` text; `<delete>` if removed |
| `announcement` / `not_announcement` | admins-only-post on/off | `v_id` |
| `locked` / `unlocked` | admins-only-edit-info on/off | — |
| `create` | group created (sole child) | full `<group>` element |
| `ephemeral` / `not_ephemeral` | disappearing timer set/cleared | `expiration` |
| `invite` | invite link reset | `code` |
| `membership_approval_mode` | join-approval toggled | `<group_join state="on\|off">` |
| `member_add_mode` | who-can-add changed | text `admin_add` / `all_member_add` |

`<participant>` attributes: `jid` (the member, LID or PN), `phone_number` (when
`jid` is LID), `lid` (when `jid` is PN), `type` (`admin`/`superadmin`), optional
`error`, optional `display_name`.

Example (members added, LID-addressed):

```xml
<notification from="120363…@g.us" participant="55999@lid"
              participant_pn="…@s.whatsapp.net" type="w:gp2" id="ABC" t="…">
  <add v_id="7" prev_v_id="6">
    <participant jid="44777@lid" phone_number="…@s.whatsapp.net"/>
  </add>
</notification>
```

## 2. Acking a `w:gp2` notification

```xml
<ack class="notification" id="<notification id>" to="<group JID>"
     [participant="<participant>"] type="w:gp2"/>
```

- `class` = the received tag (`notification`); `id` = the notification id; `to` =
  `from` (the group).
- `participant` / `recipient` are copied only if present on the incoming node.
- `type` is included for notifications (it's omitted only for `class="message"`).

## 3. Sender keys on membership change

Group encryption uses Signal **sender keys**: each sender has one chain per group,
distributed to members via a SenderKeyDistributionMessage (SKDM) over pairwise
sessions. The chain is a symmetric ratchet with no backward secrecy. So when a
member is **removed**, the remaining members should discard their current sender
key for that group and mint a fresh chain, re-distributed only to the remaining
members — otherwise the removed member could still derive future message keys.

Concretely, on a `remove`: drop our own group sender key so the next send creates a
new chain and re-distributes to the new member set. The removed member's own
sender key in our store may be kept (harmless — they can't send once removed).

(This matters only on the send side; a receive-only client needs none of it.)

## 4. Incoming group message + receipt

A group content message:

```xml
<message from="120363…@g.us" participant="44777@lid"
         participant_pn="…@s.whatsapp.net" addressing_mode="lid" id="MID" t="…"
         notify="Bob" type="text">
  <enc v="2" type="pkmsg|msg">…</enc>   <!-- pairwise: the sender's SKDM (first msg) -->
  <enc v="2" type="skmsg">…</enc>       <!-- the group content -->
</message>
```

- The **sender** is the `participant` attribute (not `from`, which is the group).
- A message can carry BOTH a pairwise `<enc>` (distributing the sender's key) AND
  the `<enc type="skmsg">` with the content. Decrypt the pairwise enc FIRST (to
  store the sender key), THEN the skmsg — the skmsg plaintext is the real message.
  Decrypting only the pairwise one yields just the SKDM (no content), so the
  message would be missed.
- The sender key is stored/looked up under `(group, sender)`; the SKDM's `groupId`
  equals the group JID, so the store key matches the skmsg-decrypt key.

Delivery receipt sent back:

```xml
<receipt to="120363…@g.us" participant="44777@lid" id="MID"/>
```

`to` = the group, `participant` = the sender (copied from the incoming node), `id`
= the message id. (A read receipt is separate and user-driven, with `type="read"`.)

## 5. pn vs lid in notifications

Modern groups are LID-addressed: the `participant` attribute and each
`<participant jid=…>` are LIDs, with the phone number in the `phone_number`
cross-attribute (and conversely `lid` when `jid` is a PN).

## 6. Mapping to our code

- `WhatsAppAccount.onNotification` routes `type="w:gp2"` to `onGroupNotification`,
  which patches the cached metadata and the room/group in place (create/subject/
  description/add/remove/promote/demote/flags) and acks.
- `decryptStanza` decrypts the pairwise enc(s) first (storing the SKDM via
  `processSenderKeyDistribution`), then the skmsg, returning the skmsg content.
- `sendDeliveryReceipt` copies `participant` for groups; `sendAck` already builds
  the correct `w:gp2` ack.
