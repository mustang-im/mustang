# Cross-Client XMPP Interop Research (OMEMO-focused)

Goal: build a new TS XMPP client that interoperates (send + receive, incl. OMEMO E2EE) with the
most popular end-user clients. This document reads the **actual source code** of the other major
clients (Conversations is covered in a separate deep-dive and used here only as the reference
baseline), documents each one's wire behaviour, then enumerates concrete interop discrepancies and
the single safest choice for each.

Clients/libraries read (shallow clones under `/tmp/xmpp-research/clients/`):

| Client | Lang | OMEMO stack read | Repo |
|---|---|---|---|
| **Dino** | Vala | `plugins/omemo/` + shared `xmpp-vala/.../0384_omemo/` + libsignal-protocol-c | github.com/dino/dino |
| **Gajim** | Python | `gajim/common/modules/omemo.py` → **nbxmpp** wire + **omemo-dr** crypto | dev.gajim.org/gajim/gajim, .../python-nbxmpp, .../omemo-dr |
| **Monal** | ObjC | `Monal/Classes/MLOMEMO.m`, `AESGcm.m`, `MLSignalStore.m` + SignalProtocol-ObjC | github.com/monal-im/Monal |
| **Syndace stack** | Python | `python-oldmemo` (legacy ns), `python-twomemo` (omemo:2) — used by slixmpp/poezio/profanity | github.com/Syndace/* |
| **Conversations** | Java | reference baseline (XEP-0384 v0.3.0 + libsignal-protocol-java) | reference only |

**Headline result:** every actively-deployed legacy OMEMO client — Conversations, Dino, Gajim,
Monal, and the Syndace oldmemo backend — agrees on the `eu.siacs.conversations.axolotl` wire format
down to the byte level, with **one hard incompatibility (Monal rejects any IV length != 12 bytes)**
and a handful of soft asymmetries (prekey spelling, key-encoding tolerance, IV tolerance). `urn:xmpp:omemo:2`
(twomemo) is a different, non-interoperable protocol (AES-256-CBC+HMAC, SCE envelopes, 32-byte Ed25519
keys) that **no** mainstream end-user client sends by default today. **Send legacy. Send 12-byte IVs.
Send 33-byte (0x05-prefixed) keys. Send `prekey="true"`. Accept everything.**

---

## 1. Conversations (reference baseline)

Source of truth: the original protoXEP **XEP-0384 v0.3.0** (authored by the Conversations dev) +
libsignal-protocol-java + community history.

- **Namespace / nodes:** `eu.siacs.conversations.axolotl`. devicelist = `eu.siacs.conversations.axolotl.devicelist`;
  bundle = `eu.siacs.conversations.axolotl.bundles:<deviceid>` (one node **per device**); PEP item id `current`.
- **Bundle elements:** `<signedPreKeyPublic signedPreKeyId='..'>`, `<signedPreKeySignature>`, `<identityKey>`,
  `<prekeys><preKeyPublic preKeyId='..'>…`. All base64.
- **Message:** `<encrypted xmlns='eu.siacs.conversations.axolotl'><header sid='..'><key rid='..'>…</key>
  <key prekey="true" rid='..'>…</key><iv>…</iv></header><payload>…</payload></encrypted>`.
  prekey attribute value in the spec example is the string **`"true"`**.
- **Crypto:** AES-128-GCM. "The 16 bytes key and the GCM authentication tag … are concatenated and …
  encrypted using the … SignalProtocol session" — so the signal-encrypted blob in each `<key>` is
  **`key(16) || tag(16)` = 32 bytes**, and `<payload>` holds **ciphertext only** (no tag).
- **IV:** the XEP doesn't state a length. Historically Conversations **sent 16-byte IVs**, which broke
  GCM libraries that only accept 12; the ecosystem switched to **12 bytes**. Conversations now
  **sends 12, reads both 12 and 16** ([Smack PR#365](https://github.com/igniterealtime/Smack/pull/365),
  [ChatSecure#1171](https://github.com/ChatSecure/ChatSecure-iOS/issues/1171)).
- **Key encoding:** libsignal-protocol-java serializes Curve25519 public keys with the **0x05 type
  prefix → 33 bytes** on the wire (identityKey, signedPreKeyPublic, preKeyPublic). Decode requires 0x05+33.
- **MUC:** members-only + non-anonymous rooms; recipients addressed by **real bare JIDs**.
- **aesgcm://** media: `aesgcm://host/path#<hex iv><hex key>`; 12-byte IV (24 hex) + 32-byte key (64 hex),
  GCM tag appended to the uploaded ciphertext.

---

## 2. Dino (Vala) — `eu.siacs.conversations.axolotl`, libsignal-protocol-c

### Namespace & nodes
`plugins/omemo/src/protocol/stream_module.vala:8-11` and the shared
`xmpp-vala/src/module/xep/0384_omemo/omemo_encryptor.vala:7-10`:
```vala
internal const string NS_URI = "eu.siacs.conversations.axolotl";
private const string NODE_DEVICELIST = NS_URI + ".devicelist";
private const string NODE_BUNDLES = NS_URI + ".bundles";
```
Bundle published per-device: `string node_id = @"$NODE_BUNDLES:$device_id";`
(`stream_module.vala:303`). Devicelist publish uses item id `id` (echoes existing) and
`<list>`/`<device id=..>` (`stream_module.vala:67,80`). Dino **only** speaks legacy; it has no
`urn:xmpp:omemo:2` path.

### Bundle structure (`stream_module.vala:284-307`)
`<bundle xmlns=axolotl>` → `<signedPreKeyPublic signedPreKeyId=..>`, `<signedPreKeySignature>`,
`<identityKey>`, `<prekeys><preKeyPublic preKeyId=..>…`. Parsed identically in `bundle.vala`
(`get_deep_attribute("signedPreKeyPublic","signedPreKeyId")`, etc.). **Matches Conversations exactly.**

### `<encrypted>` node & prekey (`omemo_encryptor.vala:42-71`)
```vala
StanzaNode key_node = new StanzaNode.build("key", NS_URI)
        .put_attribute("rid", device_id.to_string()) ...
if (prekey) key_node.put_attribute("prekey", "true");   // SENDS prekey="true"
```
Header carries `sid`, `<iv>`, `<key rid [prekey="true"]>`; `<payload>` present only if ciphertext != null.
Decode (`omemo_decryptor.vala:48`): `key_node.get_attribute_bool("prekey")`, and `get_attribute_bool`
(`xmpp-vala/src/core/stanza_node.vala:159`) returns true for **`"true"` or `"1"`** → Dino **reads both
spellings**.

### Message crypto (`plugins/omemo/src/logic/encrypt.vala:23-45`)
```vala
const uint KEY_SIZE = 16;   // AES-128
const uint IV_SIZE = 12;    // 12-byte IV
uint8[] aes_encrypt_result = aes_encrypt(Cipher.AES_GCM_NOPADDING, key, iv, plaintext.data);
uint8[] ciphertext = aes_encrypt_result[0:len-16];
uint8[] tag        = aes_encrypt_result[len-16:len];
keytag = key(16) || tag(16);   // 32 bytes -> signal-encrypted per device
ret.ciphertext = ciphertext;   // <payload> = ciphertext only
```
**Decrypt is tolerant** (`logic/decrypt.vala:144-156`):
```vala
if (key.length >= 32) {              // XEP layout: tag is in the key blob
    int authtaglength = key.length - 16;
    new_ciphertext = ciphertext || key[16:];   // re-append tag onto payload
    key = key[0:16];
}                                    // else (<32): tag already on payload, key as-is
return key;
```
So Dino sends the standard `key||tag`/payload-without-tag layout and **accepts both** the
key-carries-tag layout and the legacy tag-on-payload layout. There is **no IV length check** in Dino's
message decrypt → it will GCM-decrypt with whatever IV length it is given (12 or 16 both work).

### File transfer / aesgcm:// (`file_encryptor.vala`, `file_decryptor.vala`)
- Encrypt (`file_encryptor.vala:23-24,62-67`): **KEY_SIZE=32 (AES-256)**, IV_SIZE=12; fragment =
  `hex(iv)+hex(key)` = 24+64 = 88 hex; `aesgcm://` scheme; size = plaintext+16 (tag appended to body).
- Decrypt regex (`file_decryptor.vala:14`):
  `^aesgcm://(.*)#(([A-Fa-f0-9]{2}){48}|([A-Fa-f0-9]{2}){44})$` → accepts **48-byte** (16-IV + 32-key)
  **or 44-byte** (12-IV + 32-key) fragments; IV computed as `iv_and_key[0:len-32]`
  (`file_decryptor.vala:56`). So Dino **accepts both 12- and 16-byte IVs for media**.

### MUC (`plugins/omemo/src/logic/manager.vala:82-96`, `libdino/.../muc_manager.vala:255-258`)
`get_occupants()` returns **real bare JIDs** from `get_offline_members`. OMEMO/“private room” gate:
```vala
return has_feature_offline(..,"muc_membersonly") && has_feature_offline(..,"muc_nonanonymous");
```
Same room requirement as Conversations.

---

## 3. Gajim (Python) — nbxmpp wire + omemo-dr crypto — legacy ns

Gajim's app module `gajim/common/modules/omemo.py` is thin; the wire format lives in **nbxmpp**
(`nbxmpp/modules/omemo.py`) and the crypto in **omemo-dr** (`src/omemo_dr/`). Modern Gajim still
operates OMEMO entirely in the **legacy** namespace.

### Namespace & nodes
`nbxmpp/namespaces.py:116-118`:
```python
OMEMO_TEMP        = "eu.siacs.conversations.axolotl"
OMEMO_TEMP_BUNDLE = "eu.siacs.conversations.axolotl.bundles"
OMEMO_TEMP_DL     = "eu.siacs.conversations.axolotl.devicelist"
```
The active handler registers on `Namespace.OMEMO_TEMP` (`modules/omemo.py:137`), `set_bundle` uses
`self.backend.get_bundle(Namespace.OMEMO_TEMP)` (`modules/omemo.py:568`). Bundle node is
`f"{OMEMO_TEMP_BUNDLE}:{device_id}"` (`nbxmpp/modules/omemo.py:148`), item id `current`. devicelist
node `OMEMO_TEMP_DL`, item id `current` (`omemo.py:114-118`).
**Reception only:** `gajim/common/const.py:361-363` maps `eu.siacs.conversations.axolotl`,
`urn:xmpp:omemo:1`, **and** `urn:xmpp:omemo:2` all to the EME label "OMEMO" (for display), but the
OMEMO **module/handler does not process omemo:1/omemo:2** — it sends and decrypts legacy only.

### Bundle / devicelist / encrypted structure (`nbxmpp/modules/omemo.py`)
`_make_bundle` (l.328-374) and `_parse_bundle` (l.242-325) use exactly
`signedPreKeyPublic@signedPreKeyId`, `signedPreKeySignature`, `identityKey`,
`prekeys/preKeyPublic@preKeyId`. `create_omemo_message` (l.416-455):
```python
encrypted = Node("encrypted", attrs={"xmlns": Namespace.OMEMO_TEMP})
header = Node("header", attrs={"sid": omemo_message.sid})
for rid,(key,prekey) in omemo_message.keys.items():
    attrs = {"rid": rid}
    if prekey: attrs["prekey"] = "true"     # SENDS prekey="true"
    header.addChild("key", attrs=attrs).addData(b64encode(key))
header.addChild("iv").addData(b64encode(omemo_message.iv))
payload = encrypted.addChild("payload"); payload.addData(b64encode(omemo_message.payload))
```
Also adds EME `<encryption namespace='eu.siacs.conversations.axolotl' name='OMEMO'>` and a
`<store xmlns='urn:xmpp:hints'/>`. prekey parse (l.225-232) → `from_xs_boolean`, which accepts
**`"1"`,`"true"`,`"True"`** (`nbxmpp/util.py:90-97`) → Gajim **reads both spellings**.
KeyTransport: `get_key_transport_message` (l.477-495) emits the same `<encrypted>` **without `<payload>`**.

### Publish-options (`nbxmpp/modules/pubsub.py:466-486`, `omemo.py:102-155`)
Both devicelist and bundle publish with `<publish-options>` form
(`FORM_TYPE=…pubsub#publish-options`, `pubsub#persist_items=true`, `pubsub#access_model=open`) and,
on `precondition-not-met`, fall back to reconfiguring the node (`pubsub.py:148-152`). This is the
Conversations-compatible approach.

### Crypto (`omemo-dr/src/omemo_dr/aes.py`)
```python
IV_SIZE = 12
def aes_encrypt(plaintext):                 # message
    key, iv, tag, payload = _encrypt(plaintext, 16)   # AES-128-GCM
    key += tag                              # 32-byte key||tag -> signal-encrypted
    return EncryptionResult(payload=payload, key=key, iv=iv)   # <payload> = ciphertext only
def aes_decrypt(_key, iv, payload):
    if len(_key) >= 32:                     # XEP layout
        data=payload; key=_key[:16]; tag=_key[16:]
    else:                                   # legacy: tag on payload
        data=payload[:-16]; key=_key; tag=payload[-16:]
    return _decrypt(key, iv, tag, data).decode()
```
Identical to Dino/Conversations. **No explicit IV-length check** (delegates to `cryptography`'s GCM,
which accepts 12 or 16). File: `aes_encrypt_file` uses key_size=32 (AES-256), IV 12, tag appended to
payload (`aes.py:88-96`).

### Key encoding — 33 bytes, accepts 32 too (`omemo-dr/src/omemo_dr/ecc/djbec.py`, `const.py`)
```python
LEGACY_ENCODED_KEY_LENGTH = 33   # const.py
ENCODED_KEY_LENGTH        = 32
DJB_TYPE = 0x05                  # djbec.py:15
def serialize(self): return ByteUtil.combine([DJB_TYPE], self._public_key)   # SENDS 33 bytes (0x05||key)
@classmethod
def from_bytes(cls, b):
    if len(b)==33 and b[0]==0x05: return cls(b[1:])   # accepts 33
    if len(b)==32:                return cls(b)        # ALSO accepts bare 32
    raise InvalidKeyException(...)
```
Gajim **publishes 33-byte keys** (0x05 prefix) and is the **most lenient decoder** (accepts 32 or 33).

### MUC (`gajim/common/modules/omemo.py:544-552, 503-516`)
`_check_if_omemo_capable`: `disco_info.muc_is_members_only and disco_info.muc_is_nonanonymous`.
Members addressed by **real bare JIDs** (`contact.real_jid.bare`, `muc_user.jid.bare`).

---

## 4. Monal (Objective-C) — `eu.siacs.conversations.axolotl`, SignalProtocol-ObjC

### Namespace & nodes (`Monal/Classes/MLOMEMO.m`)
devicelist node `eu.siacs.conversations.axolotl.devicelist` (l.85, 327, 342, 637-642), bundle node
`[NSString stringWithFormat:@"eu.siacs.conversations.axolotl.bundles:%u", deviceid]` (l.665, 1048),
item id `current`, `<list>`/`<device id>`. Legacy only; no omemo:2 path.

### Bundle (`MLOMEMO.m:1028-1051`)
`<bundle xmlns=axolotl>` → `signedPreKeyPublic@signedPreKeyId`, `signedPreKeySignature`, `identityKey`,
`prekeys/preKeyPublic@preKeyId`. Publish config `pubsub#persist_items=true`, `pubsub#access_model=open`
(l.1049-1050). Parse at l.846-902. **Matches Conversations exactly.**

### `<encrypted>` & prekey — **sends `prekey="1"`** (`MLOMEMO.m:1330-1333`)
```objc
[xmlHeader addChildNode:[[MLXMLNode alloc] initWithElement:@"key" withAttributes:@{
    @"rid": [NSString stringWithFormat:@"%@", device],
    @"prekey": (deviceEncryptedKey.type == SignalCiphertextTypePreKeyMessage ? @"1" : @"0"),
}...]];
```
This is the one client that **emits `prekey="1"`/`"0"`** rather than `"true"`. On read it uses
`@prekey|bool` (l.1386), and Monal's bool parser (`MLXMLNode.m:628-637`) accepts **`"1"` or `"true"`**
→ Monal **reads both spellings**. Header has `sid`, `<iv>`; `<payload>` omitted for KeyTransport
(l.1216-1244, `isKeyTransportElement = ![envelope check:@"payload"]`).

### Crypto (`Monal/Classes/AESGcm.m`, `MLOMEMO.m`)
`KEY_SIZE = 16` (AES-128, `MLOMEMO.m:31`). `AESGcm encrypt:` (`AESGcm.m:27-41`):
```objc
EncryptedPayload* payload = [crypto encryptGCMWithKey:gcmKey decryptedContent:body];
combinedKey = gcmKey;  [combinedKey appendData:payload.tag];   // 16+16=32 -> signal-encrypted
return ... body:payload.body key:combinedKey iv:payload.iv ...; // <payload> = ciphertext only
```
**Decrypt is tolerant on key layout** (`MLOMEMO.m:1487-1493`):
```objc
if(decryptedKey.length == 16 * 2) { key=[..0,16]; auth=[..16,16]; }  // tag in key
else                              { key=decryptedKey; }              // tag on payload
```
`AESGcm decrypt:` (`AESGcm.m:62-65`): `combined = iv || body || auth` ("if auth is nil assume it
already was appended to body") → handles both layouts.

> **HARD interop break (Monal):** `MLOMEMO.m:1499-1502` requires **`iv.length == 12`** and otherwise
> returns "iv.length != 12". Monal **cannot decrypt a 16-byte-IV OMEMO message** (the old
> Conversations/ChatSecure layout). Conversations/Dino/Gajim all tolerate 16; Monal does not.

### File transfer / aesgcm:// (`Monal/Classes/MLFiletransfer.m`)
- Encrypt (l.779-829): **keySize 32 (AES-256)**, IV 12 (from `genIV`), tag appended to uploaded body
  (`encryptedData = body || authTag`), fragment = `hex(iv) || hex(key[0:32])` and comment says
  "(conversations compatibility)".
- Decrypt (l.244-258): **hardcodes `ivLength = 24` hex (12-byte IV)**, reads next 64 hex as key,
  requires `key.length==32 && iv.length==12`. → Monal **cannot decode a 16-byte-IV aesgcm:// link**
  (it would mis-slice the fragment). File-transfer analog of the message-IV constraint.

### MUC (`MLOMEMO.m:1528-1549`, `MLMucProcessor.m:1525-1526`)
MUC sender addressed by `mucParticipantJid` (real bare JID). Room is `kMucTypeGroup` (OMEMO-capable)
iff `muc_nonanonymous && muc_membersonly` (`MLMucProcessor.m:1525-1526`). Same gate as the others.

---

## 5. Syndace stack (slixmpp / poezio / profanity-omemo)

Two backends behind `omemo` (`python-omemo`): **oldmemo** (legacy) and **twomemo** (omemo:2). These
matter because poezio/profanity and other slixmpp tools use them; they're also the cleanest spec of
both formats.

### oldmemo = `eu.siacs.conversations.axolotl` (`python-oldmemo/oldmemo/`)
- `NAMESPACE = "eu.siacs.conversations.axolotl"` (`oldmemo.py:57`). XSD (`etree.py`) defines the exact
  same bundle + `<encrypted>` schema; **prekey declared `xs:boolean`** and emitted as `"true"`
  (`etree.py:324`: `key_elt.set("prekey","true")`).
- Crypto: **AES-128-GCM, 12-byte IV** (`oldmemo.py:1264-1279`), `key + auth_tag` ratchet-encrypted
  (`oldmemo.py:1307`), `<payload>` = ciphertext only. Identical scheme.
- Key encoding: `IDENTITY_KEY_ENCODING_LENGTH = 33  # one byte constant + 32 bytes key`
  (`oldmemo.py:305`); decode requires `len==33 and [0]==0x05` (`oldmemo.py:349`). **33 bytes, 0x05.**

> This independent implementation triangulates the legacy consensus: ns, nodes, elements, `prekey="true"`,
> AES-128-GCM, 12-byte IV, key||tag, 33-byte 0x05 keys — all match Conversations/Dino/Gajim/Monal.

### twomemo = `urn:xmpp:omemo:2` (`python-twomemo/twomemo/`) — DIFFERENT PROTOCOL
- `NAMESPACE = "urn:xmpp:omemo:2"` (`twomemo.py:54`). Nodes per OMEMO:2:
  `urn:xmpp:omemo:2:devices` / `urn:xmpp:omemo:2:bundles` (single bundles node, item id = device id).
- **Payload AEAD = AES-256-CBC + HMAC-SHA-256 truncated to 16 bytes** (`twomemo.py:91,105-109,128`),
  **not GCM**. **IV is HKDF-derived** (`twomemo.py:187`), **not** carried as a 12-byte `<iv>`.
- Content is wrapped in **SCE** (`urn:xmpp:sce:1` `<envelope>`/`<content>`), not a bare `<payload>` body.
- Identity key is **Ed25519, encoded as 32 raw bytes** (`twomemo.py:238`
  `IDENTITY_KEY_ENCODING_LENGTH = 32`), vs legacy's 33-byte Curve25519.
- **Not wire-compatible with legacy at all.** No mainstream end-user client sends omemo:2 by default.

---

## 6. Auxiliary XEPs — cross-client support (namespaces grepped from source)

| XEP | ns | Dino | Gajim/nbxmpp | Monal | Notes |
|---|---|---|---|---|---|
| **Reactions 0444** | `urn:xmpp:reactions:0` | yes | yes | yes | Monal parses `{urn:xmpp:reactions:0}reactions` + fallback body (`MLMessageProcessor.m:496-501`). |
| **Retraction 0424** | `urn:xmpp:message-retract:1` | yes (`:1`) | yes (`:0` **and** `:1`) | yes (`:1`) | Gajim still understands old `message-retract:0`; everyone sends/handles `:1`. |
| **Moderation 0425/0428** | `urn:xmpp:message-moderate`, `fallback:0` | yes | yes | yes (`MLMessage.m:228-238`) | MUC moderated retraction. |
| **Replies 0461** | `urn:xmpp:reply:0` | yes (`xmpp-vala/.../0461_replies.vala`) | yes (`ALLOWED_TAGS` whitelists `reply`) | **NO** (zero `urn:xmpp:reply` refs in Monal) | **Flag:** sending a 0461 reply to Monal → it shows the fallback body only, no quote UI. Always include a textual fallback. |
| **Correction 0308** | `urn:xmpp:message-correct:0` | yes | yes | yes | Universal. |
| **HTTP Upload 0363** | `urn:xmpp:http:upload:0` | yes (also old `…http:upload`) | yes | yes | URL shared in **body + `jabber:x:oob` `<x><url>`** (Dino `0363_http_file_upload.vala:198-199`; Monal `setOobUrl` `xmpp.m:4063`). Encrypted → `aesgcm://` in body. |
| **Chat Markers 0333** | `urn:xmpp:chat-markers:0` | yes | yes | yes | Universal. |
| **Receipts 0184** | `urn:xmpp:receipts` | yes | yes | yes | Universal. |
| **Unique IDs 0359** | `urn:xmpp:sid:0` | yes | yes | yes | origin-id/stanza-id; needed to key reactions/retractions/replies. |

OMEMO interaction with these: Gajim's `ALLOWED_TAGS` (`modules/omemo.py:71-89`) is the explicit list
of child elements **kept on the outer (cleartext) stanza** when encrypting (receipts request,
chatstates, markers, hints, correction `replace`, `reply`, `fallback`, `origin-id`, `reactions`).
That means these control elements travel **in clear** alongside the OMEMO `<encrypted>` — your client
must place them on the outer message, not inside the encrypted payload, to interop with legacy clients.

---

## 7. OMEMO INTEROP SIMULATION (A sends → B receives), legacy ns

For each pair, walk the bytes. "OK" = decrypts. The only failures are IV-length related (Monal) and
the (purely theoretical, since no one sends them) 32-byte-key case against libsignal clients.

- **Conversations → Dino / Gajim / Monal:** Conversations sends `prekey="true"`, 12-byte IV (modern),
  key||tag(32), payload-no-tag, 33-byte keys. All three decode prekey (all accept "true"), all accept
  the 32-byte key blob, all accept 33-byte bundle keys. **OK all three.**
  *Old* Conversations (16-byte IV) → Dino OK, Gajim OK, **Monal FAILS** (`iv.length != 12`).
- **Dino → Conversations / Gajim / Monal:** sends `prekey="true"`, 12-byte IV, key||tag(32),
  33-byte keys. **OK all three** (Monal gets 12-byte IV → fine).
- **Gajim → Conversations / Dino / Monal:** sends `prekey="true"`, 12-byte IV, key||tag(32),
  **33-byte keys** (0x05). **OK all three.**
- **Monal → Conversations / Dino / Gajim:** sends **`prekey="1"`**, 12-byte IV, key||tag(32),
  33-byte keys. Conversations/libsignal-java reads `"1"` as boolean true; Dino `get_attribute_bool`
  accepts "1"; Gajim `from_xs_boolean` accepts "1". **OK all three.** (If any client read prekey with a
  strict `=="true"` test it would break — none of the ones read here do, but **don't send `"1"` from
  the new client** to be safe against unknown strict parsers.)
- **Any → twomemo (omemo:2) client:** **FAIL** — different namespace, AEAD, key encoding. Irrelevant
  for default interop; only matters if you opt into omemo:2.

### Concrete discrepancies that can break decryption / cause stanzas to be ignored
1. **IV length 16 vs 12.** Monal hard-rejects 16 (message: `MLOMEMO.m:1499`; media: `MLFiletransfer.m:251,258`).
   Dino/Gajim/Conversations tolerate both. **→ Always send 12.**
2. **prekey spelling `"1"` vs `"true"`.** Monal sends `"1"`. All readers here accept both, but a strict
   `=="true"` reader (possible in lesser clients) would treat `"1"` as not-a-prekey and try a normal
   (whisper) decrypt → MAC failure / ignored. **→ Send `"true"`; accept `"true"`,`"1"`,`"0"`,`"false"`.**
3. **Key encoding 33 vs 32 bytes.** Everyone *sends* 33 (0x05). libsignal-c/java (Conversations, Dino,
   Monal) **require** 0x05+33 and **reject a bare 32-byte** key in a bundle → session build fails →
   that device silently dropped. omemo-dr (Gajim) accepts both. **→ Always publish 33 bytes (0x05||key).**
4. **Tag placement (key||tag vs tag-on-payload).** Everyone *sends* key||tag(32) with payload-no-tag,
   and everyone's decrypt has an explicit fallback for the legacy tag-on-payload layout. Safe either
   direction. **→ Send key||tag(32), payload = ciphertext only.**
5. **MUC room type.** All require members-only + non-anonymous and address by **real bare JID**. A
   public/semi-anonymous room → recipients can't be resolved → no encryption / ignored. **→ Require both.**
6. **Control elements inside vs outside `<encrypted>`.** Receipts/markers/correction/reply/reactions/
   origin-id must be on the **outer** stanza (see Gajim `ALLOWED_TAGS`). Burying them in the OMEMO
   payload makes legacy clients ignore them.

---

## 8. DISCREPANCY MATRIX

Rows = wire detail. Columns = what each client **does** (S = sends / publishes, R = accepts on read).

| Wire detail | Conversations | Dino | Gajim (nbxmpp/omemo-dr) | Monal | Syndace oldmemo |
|---|---|---|---|---|---|
| **Send namespace** | `eu.siacs.conversations.axolotl` | same | same | same | same |
| **Can receive omemo:2** | no (legacy build) | no | EME-label only, **not decoded** | no | no (separate twomemo backend) |
| **devicelist node** | `…axolotl.devicelist` | same | same | same | same |
| **bundle node** | `…axolotl.bundles:<id>` (per-device) | same | same | same | same |
| **PEP item id** | `current` | `current` (devicelist echoes id) | `current` | `current` | `current` |
| **publish-options access_model** | `open` (+precondition) | sets node config to `open` after publish | `open` via `<publish-options>`, reconfig fallback | `open` (configOptions) | n/a (lib) |
| **Bundle elements** | signedPreKeyPublic@signedPreKeyId, signedPreKeySignature, identityKey, prekeys/preKeyPublic@preKeyId | same | same | same | same |
| **identityKey/SPK/PK encoding** | **S/R 33** (0x05, libsignal-java) | **S/R 33** (0x05, libsignal-c) | **S 33**, **R 33 or 32** | **S/R 33** (0x05, Signal-ObjC) | **S/R 33** (`len==33 && [0]==0x05`) |
| **`<key>` prekey value (S)** | `"true"` | `"true"` | `"true"` | **`"1"`** | `"true"` |
| **prekey value accepted (R)** | true/1 (java boolean) | `"true"` or `"1"` | 1/true/True | `"1"` or `"true"` | xs:boolean (1/true/0/false) |
| **Message AEAD** | AES-128-GCM | AES-128-GCM | AES-128-GCM | AES-128-GCM | AES-128-GCM |
| **Message IV length (S)** | **12** (was 16 historically) | **12** | **12** | **12** | **12** |
| **Message IV accepted (R)** | **12 or 16** | **12 or 16** (no check) | **12 or 16** (no check) | **12 ONLY** (rejects 16) | 12 (GCM lib) |
| **GCM tag placement (S)** | `key‖tag`(32) in `<key>`; payload no tag | same | same | same | same |
| **Tag layout accepted (R)** | key‖tag **and** tag-on-payload | both (`>=32` / `<32`) | both (`>=32` / `<32`) | both (`==32` / else) | key‖tag |
| **KeyTransport (no `<payload>`)** | supported | supported (ciphertext null → no payload) | supported (`get_key_transport_message`) | supported (`isKeyTransportElement`) | supported (`encrypt_empty`) |
| **File AEAD / key size** | AES-256-GCM | AES-256-GCM (KEY_SIZE 32) | AES-256-GCM | AES-256-GCM (keySize 32) | n/a |
| **aesgcm:// fragment** | `hex(iv12)+hex(key32)` (88 hex) | S 88 hex; **R 88 or 96** (12/16 IV) | (Gajim builds 12-IV) | S 88 hex; **R 88 ONLY** (iv must be 12) | n/a |
| **File GCM tag** | appended to body | appended to body | appended to body | appended to body | n/a |
| **MUC room type** | membersonly + nonanon | membersonly + nonanon | members_only + nonanonymous | membersonly + nonanon | n/a |
| **MUC addressing** | real bare JID | real bare JID | real bare JID | real bare JID | n/a |
| **XEP-0461 replies** | yes | yes | yes | **NO** | n/a |

---

## 9. RECOMMENDATIONS (single most-interoperable choice per detail)

For the new TS client, to maximize interop with Conversations + Dino + Gajim + Monal (+ Syndace oldmemo):

**OMEMO namespace / discovery**
- **Send `eu.siacs.conversations.axolotl`** (legacy / "OMEMO 0.3"). Do **not** default to `urn:xmpp:omemo:2`
  — no mainstream end-user client decodes it. (Optionally also support omemo:2 receive later, but it's a
  separate AES-256-CBC+HMAC/SCE stack; not needed for interop today.)
- devicelist node `eu.siacs.conversations.axolotl.devicelist`; bundle node
  `eu.siacs.conversations.axolotl.bundles:<deviceId>` (one node per device); **PEP item id `current`**.
- Publish both with **`<publish-options>`** form `FORM_TYPE=http://jabber.org/protocol/pubsub#publish-options`,
  `pubsub#persist_items=true`, **`pubsub#access_model=open`**; on `precondition-not-met`, reconfigure the
  node to open and re-publish (Gajim/Conversations behaviour). Use `+notify` on the devicelist node.

**Bundle**
- Elements exactly: `<signedPreKeyPublic signedPreKeyId='N'>`, `<signedPreKeySignature>`, `<identityKey>`,
  `<prekeys><preKeyPublic preKeyId='N'>…</prekeys>`, all base64. Publish ~100 prekeys.

**Key encoding on the wire (critical)**
- **Publish identityKey / signedPreKeyPublic / preKeyPublic as 33 bytes = `0x05 || 32-byte X25519`,
  base64.** libsignal-c/java clients (Conversations, Dino, Monal) reject bare 32-byte keys.
- On **read**, accept **both** 33 (strip leading 0x05) and 32 (use as-is) for robustness with omemo-dr-style senders.

**Message crypto**
- **AES-128-GCM** (16-byte key), **12-byte IV** (random per message), 16-byte GCM tag.
- Build the per-device blob as **`key(16) || tag(16)` = 32 bytes**, encrypt that with the libsignal
  session, put it in `<key rid=…>`. Put **ciphertext only** (no tag) in `<payload>`.
- **Send a 12-byte `<iv>` always.** Never send 16 (Monal rejects it).
- On **decrypt**, be tolerant like the others: if the signal-decrypted key blob is **≥ 32 bytes**, split
  `key=blob[0:16]`, `tag=blob[16:]`, GCM-decrypt `payload` with that tag; if it's **16 bytes** (legacy),
  treat the **last 16 bytes of `<payload>` as the tag** and the rest as ciphertext. Accept IV of 12 **or 16**
  on receive (so you can still read old Conversations/ChatSecure).

**prekey attribute**
- **Send `prekey="true"`** (not `"1"`). On read, accept **`true`/`1`** as true and **`false`/`0`**/absent as false.

**KeyTransport / empty messages**
- Support sending and receiving an `<encrypted>` with **no `<payload>`** (header + keys + iv only) to
  establish/repair sessions; add `<store xmlns='urn:xmpp:hints'/>` so it's archived. Don't render them.

**MUC**
- Only do OMEMO in rooms that are **`muc_membersonly` AND `muc_nonanonymous`**. Address each occupant
  by **real bare JID** (from affiliations / `muc#user` item). Encrypt to every member's every device
  plus your own other devices. Resolve incoming MUC sender to real bare JID via `muc#user`/MAM before decrypt.

**aesgcm:// media (XEP-0363 + OMEMO media sharing)**
- Encrypt files with **AES-256-GCM**, **12-byte IV**, GCM tag **appended to the uploaded ciphertext**.
- Build the URL `aesgcm://host/path#<hex(iv 12B = 24 hex)><hex(key 32B = 64 hex)>` (88 hex total).
- Put that `aesgcm://` URL in the **message body** and also in **`<x xmlns='jabber:x:oob'><url>…</url></x>`**.
- On **download**, accept fragments of **88 hex (12-IV)** and **96 hex (16-IV)**: compute IV =
  everything except the last 64 hex (the key), like Dino, so you can read old 16-IV links.

**Auxiliary XEPs / graceful fallback**
- Send modern: Reactions `urn:xmpp:reactions:0`, Retraction `urn:xmpp:message-retract:1`, Replies
  `urn:xmpp:reply:0`, Correction `urn:xmpp:message-correct:0`, Markers `urn:xmpp:chat-markers:0`,
  Receipts `urn:xmpp:receipts`, origin-id/stanza-id `urn:xmpp:sid:0`.
- **Always include a human-readable fallback body** (XEP-0428 `<fallback>` + body text) for reactions,
  replies, and retractions — **Monal does not implement XEP-0461 replies**, so the quote must degrade to
  plain text; other clients also rely on fallback for unsupported features.
- When OMEMO-encrypting, keep control elements (receipt `<request>`, chat-state, `<markable>`, hints,
  correction `<replace>`, `<reply>`, `<fallback>`, `<origin-id>`, `<reactions>`) on the **outer cleartext
  stanza** (mirror Gajim's `ALLOWED_TAGS`), not inside the encrypted payload.

**One-line summary:** *Speak `eu.siacs.conversations.axolotl`. Publish 33-byte (0x05-prefixed) keys.
AES-128-GCM with a 12-byte IV; ship `key||tag` in `<key>` and tag-less ciphertext in `<payload>`.
Write `prekey="true"`. Require members-only+non-anonymous MUCs addressed by real JID. Be maximally
liberal on receive (IV 12 or 16, key 32 or 33, prekey true/1, tag in key or on payload) — the only
client that isn't liberal is Monal, which forces 12-byte IVs, so never send anything else.*
