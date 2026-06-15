# Sending a message to a group chat

WhatsApp Android multi-device wire protocol for sending to a group.

---

## (a) The outgoing `<message>` stanza for a group

```
<message
    id="3EB0…"                 message id (see below)
    to="120363…@g.us"          the bare group JID
    type="text"                "text" for text, "media" for image/video/audio/doc/sticker
    addressing_mode="lid"      "lid" or "pn" — from the group metadata (section d)
    phash="2:…">               participant-list hash (section c)

  <participants>
    <!-- one <to> per recipient DEVICE that needs the sender key, each carrying
         the SenderKeyDistributionMessage encrypted over that device's pairwise
         Signal session: pkmsg for a new session, msg for an established one -->
    <to jid="…:0@lid"><enc v="2" type="pkmsg">…</enc></to>
    <to jid="…:7@lid"><enc v="2" type="msg">…</enc></to>
  </participants>

  <!-- present only when at least one SKDM enc above is a pkmsg -->
  <device-identity>…signed ADVSignedDeviceIdentity…</device-identity>

  <!-- the actual group message, sender-key encrypted ONCE for everyone -->
  <enc v="2" type="skmsg">…SenderKeyMessage…</enc>
</message>
```

Child order: `participants` → `device-identity` (if any pkmsg) → `enc[skmsg]`.

- The plaintext inside the `skmsg` enc is `pad(Message)` — the user-content
  `Message` protobuf (Conversation / ExtendedTextMessage / media), padded 1–15.
- The plaintext inside each `participants` `<enc>` is a `Message` protobuf whose
  only field is `senderKeyDistributionMessage { groupId, axolotlSenderKeyDistributionMessage }`.
- There is **no** `deviceSentMessage` wrapper for groups (unlike the 1:1 path).
  Our own other devices receive the SKDM (so they can decrypt the skmsg), not a
  separately-wrapped copy.
- `type="media"` carries a `mediatype` attribute on the skmsg enc.

Message id: `"3EB0"` + random uppercase hex.

---

## (b) Sender Key Distribution (SKDM)

1. Sender-key name = `(groupJID, ownIdentity)` where ownIdentity is our identity
   in the group's addressing namespace (our LID for a LID group). The sender-key
   state is created once (random keyId, random 32-byte chain key at iteration 0,
   a fresh XEdDSA signing key pair) and reused on subsequent sends.
2. The axolotl SKDM is `versionByte(0x33) || SenderKeyDistributionMessage{ id,
   iteration, chainKey, signingKey }`, where `signingKey` is the 33-byte djb form.
3. It is wrapped in a `Message{ senderKeyDistributionMessage { groupId =
   "GROUP@g.us", axolotlSenderKeyDistributionMessage } }`, encrypted per recipient
   device over the pairwise 1:1 Signal session, and placed under `<participants>`
   in the **same** stanza as the `skmsg`.

When to (re)distribute: on the first send to a group, and to any device that does
not yet hold the current sender key (a new participant or a participant's new
device). Re-distributing the current chain state is idempotent. On participant
removal, the sender key should be reset (a fresh chain) and re-distributed to the
remaining members for forward secrecy.

---

## (c) The `phash` (participant-list hash) — VERIFIED LIVE

`phash = "2:" + base64(SHA-256(sortedADStrings.join(""))[:6])`, standard base64
alphabet, no padding (6 bytes → 8 chars).

- **ADString** per device = `"<user>.0:<device>@<server>"` — user, a literal
  agent byte `0`, device index, server (`lid` or `s.whatsapp.net`).
- The hashed set is **every participant device, INCLUDING our own sending
  device**, minus hosted devices (device id 99). (Encryption still excludes our
  own sending device — it is in the hash but not in `<participants>`.)
- Sort the ADStrings lexicographically, concatenate with no separator, SHA-256,
  take the first 6 bytes, base64 (no padding), prefix `"2:"`.

**VERIFIED LIVE (byte-exact against the server's returned ack phash):**
- devices `[self:0, self:13, self:17]` → `2:3y9m/KUa`
- devices `[recipient:0, self:0, self:13, self:17]` → `2:wjiUxWD1`

The server returns its own phash in the `<ack class="message" phash="…">`. If it
differs from ours, our cached device list is stale (a member joined/left we don't
know about) → discard the cached group metadata and re-fetch before the next send.

---

## (d) addressing_mode: pn vs lid

The group metadata carries `addressing_mode = "pn" | "lid"`. Modern groups are
LID-addressed. It governs:

| group `addressing_mode` | wire `<message addressing_mode>` | our sender identity | `<to jid>` server | sender-key store address |
|---|---|---|---|---|
| `lid` | `"lid"` | our LID | `…@lid` | `(group, ourLID)` |
| `pn`  | `"pn"`  | our phone number | `…@s.whatsapp.net` | `(group, ourPN)` |

The SKDM `groupId` is always the bare `GROUP@g.us` string regardless of mode.

---

## (e) Device fan-out

1. Read the group's participants from its metadata.
2. usync the device lists for all participants in one query. We are a member, so
   our own devices come back in the same response — no separate self-query.
3. Drop hosted devices (id 99). Exclude our own current sending device from
   encryption (but keep it in the phash, section c). Keep our other devices so
   they can decrypt.
4. Establish a pairwise session with each device we have none with, then encrypt
   the SKDM per device.

---

## (f) Sender-key lifecycle

- Created when no sender-key state exists for `(group, ourIdentity)`: random
  keyId, random 32-byte chain key at iteration 0, fresh signing key pair.
- Reused on each send; `groupEncrypt` emits a SenderKeyMessage at the current
  iteration and advances the chain by one.
- The SKDM advertises the current iteration, so a newly-keyed recipient decrypts
  from that point forward.
- On a participant removal, reset (regenerate) the chain and re-distribute to the
  remaining members so the removed member cannot follow future messages.

---

## (g) Mapping to our code

- `WhatsAppSend.sendGroupMessage` builds the stanza; `participantListHashV2`
  computes the phash; `GroupCipher.createSenderKey/createDistributionMessage/
  groupEncrypt` provide the crypto; `WhatsAppGroupMetadata` supplies the
  participant list + addressing mode.
- Our sender-key store address is `${group}|${user}.${device}`, matched on both
  send and receive so our own devices (and we, after a restart) can decrypt.

---

## (h) Still to verify / open

- Sender-key reset-on-removal: implemented as the forward-secrecy-correct
  behavior; the exact trigger the official client uses is not independently
  confirmed.
- Group `<receipt type="retry">` handling: since we re-distribute the sender key
  to every device on each send, a resend re-distributes automatically; a
  device-specific group retry path is not specialized.
