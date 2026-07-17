# Conversations OMEMO + Messaging Wire Protocol — Interop Reference

Target for interop: **Conversations 2.20.1** (Android, by Daniel Gultsch / iNPUTmice).
Source cloned from `https://codeberg.org/iNPUTmice/Conversations`, commit `78de3f7cd` ("version bump to 2.20.1", 2026-06-08). libsignal dependency: `org.whispersystems:signal-protocol-java:2.6.2`.

All file paths below are relative to the Conversations repo root `src/main/java/`.

> **TL;DR for OMEMO:** Conversations sends and receives **legacy OMEMO ("0.3")** under namespace `eu.siacs.conversations.axolotl`. It does **NOT** speak `urn:xmpp:omemo:2`. Crypto is **AES-128-GCM**, **12-byte IV**, and the **16-byte GCM auth tag is moved off the payload and appended to the 16-byte AES key** → the 32-byte blob is what gets libsignal-encrypted per device; `<payload>` holds ciphertext **without** the tag. Keys on the wire are base64 of the **33-byte** (0x05-prefixed) libsignal serialization. `prekey="true"` (literal). This matches the historical XEP-0384 v0.3.0, and deviates from current XEP-0384 (`omemo:2`, which is AES-256-CBC + HMAC, 16-byte IV, `<key kex=..>`, `<pk>`).

---

## 0. OMEMO version / namespace summary

`crypto/axolotl/AxolotlService.java`:

```java
public static final String PEP_PREFIX = "eu.siacs.conversations.axolotl";          // line 74
public static final String PEP_DEVICE_LIST = PEP_PREFIX + ".devicelist";           // line 75
public static final String PEP_DEVICE_LIST_NOTIFY = PEP_DEVICE_LIST + "+notify";   // line 76
public static final String PEP_BUNDLES = PEP_PREFIX + ".bundles";                  // line 77
public static final String PEP_VERIFICATION = PEP_PREFIX + ".verification";        // line 78
```

- **Sends by default:** legacy OMEMO, namespace `eu.siacs.conversations.axolotl` (a.k.a. "OMEMO 0.3"). There is no code path that emits `urn:xmpp:omemo:2`.
- **Receives:** only the same legacy namespace. `Encrypted`/`Header`/`Key`/`IV`/`Payload` model classes (`im/conversations/android/xmpp/model/axolotl/`) all inherit `@XmlPackage(namespace = Namespace.AXOLOTL)` where `Namespace.AXOLOTL = "eu.siacs.conversations.axolotl"` (`xml/Namespace.java:5`). The parser looks up `<encrypted>` by class → namespace `eu.siacs.conversations.axolotl` only.
- **EME advertised:** `<encryption xmlns='urn:xmpp:eme:0' name='OMEMO' namespace='eu.siacs.conversations.axolotl'/>` (see §9).

> **DEVIATION from current XEP-0384:** Current XEP-0384 (2021+) uses `urn:xmpp:omemo:2`, nodes `urn:xmpp:omemo:2:devices` / `urn:xmpp:omemo:2:bundles`, `<key kex='true'>`, `<pk id=..>`, AES-256-CBC + separate HMAC, 16-byte IV, and XEP-0420 SCE payloads. **Conversations implements none of that.** To interop you must implement the legacy stack described here. (A new client MAY additionally implement `omemo:2`, but Conversations will ignore it.)

---

## 1. PEP Device List

### Node, item, structure
Generated in `generator/IqGenerator.java::publishDeviceIds` (lines 76–86):

```java
public Iq publishDeviceIds(final Set<Integer> ids, final Bundle publishOptions) {
    final Element item = new Element("item");
    item.setAttribute("id", "current");
    final Element list = item.addChild("list", AxolotlService.PEP_PREFIX);
    for (Integer id : ids) {
        final Element device = new Element("device");
        device.setAttribute("id", id);
        list.addChild(device);
    }
    return publish(AxolotlService.PEP_DEVICE_LIST, item, publishOptions);
}
```

- **Node:** `eu.siacs.conversations.axolotl.devicelist`
- **Item id:** `current`
- **Container element:** `<list xmlns='eu.siacs.conversations.axolotl'>`
- **Each device:** `<device id='<int>'/>` (the `id` is the libsignal registrationId, a 31-bit positive int)

### Concrete XML (publish)
```xml
<iq type='set' id='...'>
  <pubsub xmlns='http://jabber.org/protocol/pubsub'>
    <publish node='eu.siacs.conversations.axolotl.devicelist'>
      <item id='current'>
        <list xmlns='eu.siacs.conversations.axolotl'>
          <device id='259621608'/>
          <device id='584829741'/>
        </list>
      </item>
    </publish>
    <publish-options>
      <x xmlns='jabber:x:data' type='submit'>
        <field var='FORM_TYPE'><value>http://jabber.org/protocol/pubsub#publish-options</value></field>
        <field var='pubsub#access_model'><value>open</value></field>
      </x>
    </publish-options>
  </pubsub>
</iq>
```

### Announce-without-clobbering
`AxolotlService.java::publishOwnDeviceId` (lines 484–509): on receiving the device-list PEP notification, Conversations takes the **full received set**, adds its own id, and republishes the union:

```java
final Set<Integer> deviceIdsCopy = new HashSet<>(deviceIds);   // ids already in PEP
...
deviceIdsCopy.add(getOwnDeviceId());
publishDeviceIdsAndRefineAccessModel(deviceIdsCopy);
```

So the **whole list is always rewritten** (PEP node holds a single item id `current`). A new client MUST do the same read-modify-write: fetch the existing `<list>`, add your device id, and publish the complete list back. If you publish only your own id you will wipe the contact's other devices.

### Receive parsing
`xmpp/manager/AxolotlManager.java::handleItems` (lines 20–36): reads the first `<list>` item via `DeviceList` model (`@XmlElement(name="list")`), extracts `<device id=..>` ids, and calls `registerDevices(from, ids)`. `IqParser.deviceIds()` is the IQ-result equivalent.

### publish-options
`xmpp/pep/PublishOptions.java`:
```java
public static Bundle openAccess() {
    final Bundle options = new Bundle();
    options.putString("pubsub#access_model", "open");
    return options;
}
```
- Only `pubsub#access_model = open` is set in publish-options. **No** `max_items`/`persist_items`/`send_last_published_item` is sent in publish-options.
- publish-options are only attached if the server advertises `pubsub#publish-options` (`pepPublishOptions()`). If precondition fails (`<precondition-not-met>` in `http://jabber.org/protocol/pubsub#errors`), Conversations falls back to `pushNodeConfiguration` and reconfigures the node (`XmppConnectionService.java:3037`), submitting the server's existing config form with `access_model=open` overlaid — so it does NOT force `max_items`/`persist_items` there either; it relies on server defaults (typically `persist_items=true`, `max_items=1` for PEP).

---

## 2. PEP Bundle

### Node pattern (includes device id!)
`IqGenerator.java::retrieveBundlesForDevice` / `publishBundles`:
```java
return retrieve(AxolotlService.PEP_BUNDLES + ":" + deviceid, null);   // line 65
...
return publish(AxolotlService.PEP_BUNDLES + ":" + deviceId, item, publishOptions);  // line 117
```
- **Node:** `eu.siacs.conversations.axolotl.bundles:<deviceId>` — one node **per device**, the device id is appended after a colon.
- **Item id:** `current`

### Bundle element structure
`IqGenerator.java::publishBundles` (lines 88–118):
```java
final Element bundle = item.addChild("bundle", AxolotlService.PEP_PREFIX);
final Element signedPreKeyPublic = bundle.addChild("signedPreKeyPublic");
signedPreKeyPublic.setAttribute("signedPreKeyId", signedPreKeyRecord.getId());
ECPublicKey publicKey = signedPreKeyRecord.getKeyPair().getPublicKey();
signedPreKeyPublic.setContent(Base64.encodeToString(publicKey.serialize(), Base64.NO_WRAP));
final Element signedPreKeySignature = bundle.addChild("signedPreKeySignature");
signedPreKeySignature.setContent(Base64.encodeToString(signedPreKeyRecord.getSignature(), Base64.NO_WRAP));
final Element identityKeyElement = bundle.addChild("identityKey");
identityKeyElement.setContent(Base64.encodeToString(identityKey.serialize(), Base64.NO_WRAP));
final Element prekeys = bundle.addChild("prekeys", AxolotlService.PEP_PREFIX);
for (PreKeyRecord preKeyRecord : preKeyRecords) {
    final Element prekey = prekeys.addChild("preKeyPublic");
    prekey.setAttribute("preKeyId", preKeyRecord.getId());
    prekey.setContent(Base64.encodeToString(preKeyRecord.getKeyPair().getPublicKey().serialize(), Base64.NO_WRAP));
}
```

| Element | Namespace | Attributes | Content |
|---|---|---|---|
| `<bundle>` | `eu.siacs.conversations.axolotl` | — | children below |
| `<signedPreKeyPublic>` | (inherits bundle ns) | `signedPreKeyId='<int>'` | base64(**33-byte** key) |
| `<signedPreKeySignature>` | (inherits) | — | base64(**64-byte** Ed25519/XEdDSA signature) |
| `<identityKey>` | (inherits) | — | base64(**33-byte** identity public key) |
| `<prekeys>` | `eu.siacs.conversations.axolotl` | — | list of `<preKeyPublic>` |
| `<preKeyPublic>` | (inherits) | `preKeyId='<int>'` | base64(**33-byte** key) |

- **NUM_KEYS_TO_PUBLISH = 100** prekeys (`AxolotlService.java:82`). Replenished to 100 whenever consumed.
- Element name casing matters: `signedPreKeyPublic`, `signedPreKeySignature`, `identityKey`, `preKeyPublic`, attribute `signedPreKeyId`, `preKeyId`. (camelCase, not the `omemo:2` `<spk>`/`<pk>`.)

### 33-byte vs 32-byte (CRITICAL)
All public keys are `ECPublicKey.serialize()` / `IdentityKey.serialize()` = **33 bytes** = `0x05 || <32-byte X25519 montgomery-u>`. Confirmed:
- `DjbECPublicKey.serialize()` = `{Curve.DJB_TYPE} || publicKey`, and `Curve.DJB_TYPE = 0x05`.
- On parse, `IqParser.java` uses `Curve.decodePoint(base64decode(...), 0)` and `new IdentityKey(base64decode(...), 0)` (offset 0) — i.e. it expects the **leading 0x05 type byte**.

> **DEVIATION / TRAP:** `signedPreKeyPublic`, `identityKey`, and every `preKeyPublic` are base64 of the **33-byte** form (with the 0x05 prefix), **not** the raw 32 bytes. If your library exports raw 32-byte X25519 keys, you must prepend `0x05` before base64. Likewise, when you receive a bundle, strip the leading 0x05 (or pass offset 1) to recover the raw 32-byte key. (The historical XEP-0384 0.3.0 text shows 32-byte examples; Conversations' real wire is 33 bytes — match the code, not the old XEP.)

### Fingerprint
The OMEMO fingerprint = lowercase hex of the **33-byte** `identityKey.serialize()` (`XmppAxolotlSession.getFingerprint()` → `CryptoHelper.bytesToHex(identityKey.getPublicKey().serialize())`). 66 hex chars; the leading `05` is part of it.

### Concrete XML (publish bundle)
```xml
<iq type='set' id='...'>
  <pubsub xmlns='http://jabber.org/protocol/pubsub'>
    <publish node='eu.siacs.conversations.axolotl.bundles:259621608'>
      <item id='current'>
        <bundle xmlns='eu.siacs.conversations.axolotl'>
          <signedPreKeyPublic signedPreKeyId='1'>BASE64_33B</signedPreKeyPublic>
          <signedPreKeySignature>BASE64_64B</signedPreKeySignature>
          <identityKey>BASE64_33B</identityKey>
          <prekeys>
            <preKeyPublic preKeyId='1'>BASE64_33B</preKeyPublic>
            <preKeyPublic preKeyId='2'>BASE64_33B</preKeyPublic>
            <!-- ... up to 100 ... -->
          </prekeys>
        </bundle>
      </item>
    </publish>
    <publish-options>
      <x xmlns='jabber:x:data' type='submit'>
        <field var='FORM_TYPE'><value>http://jabber.org/protocol/pubsub#publish-options</value></field>
        <field var='pubsub#access_model'><value>open</value></field>
      </x>
    </publish-options>
  </pubsub>
</iq>
```

### Retrieve bundle (GET)
```xml
<iq type='get' to='contact@example.org' id='...'>
  <pubsub xmlns='http://jabber.org/protocol/pubsub'>
    <items node='eu.siacs.conversations.axolotl.bundles:259621608'/>
  </pubsub>
</iq>
```
`IqParser.bundle()` / `IqParser.preKeyPublics()` parse the result. Note `<items>` (no `max_items`) — server returns the single `current` item.

---

## 3. The encrypted message element

### Structure
`crypto/axolotl/XmppAxolotlMessage.java::toElement` (lines 213–232):
```java
Element encryptionElement = new Element(CONTAINERTAG, AxolotlService.PEP_PREFIX); // "encrypted"
Element headerElement = encryptionElement.addChild(HEADER);                       // "header"
headerElement.setAttribute(SOURCEID, sourceDeviceId);                             // "sid"
for (XmppAxolotlSession.AxolotlKey key : keys) {
    Element keyElement = new Element(KEYTAG);                                      // "key"
    keyElement.setAttribute(REMOTEID, key.deviceId);                              // "rid"
    if (key.prekey) {
        keyElement.setAttribute("prekey", "true");                               // literal "true"
    }
    keyElement.setContent(Base64.encodeToString(key.key, Base64.NO_WRAP));
    headerElement.addChild(keyElement);
}
headerElement.addChild(IVTAG).setContent(Base64.encodeToString(iv, Base64.NO_WRAP)); // "iv"
if (ciphertext != null) {
    Element payload = encryptionElement.addChild(PAYLOAD);                        // "payload"
    payload.setContent(Base64.encodeToString(ciphertext, Base64.NO_WRAP));
}
```

Constants (`XmppAxolotlMessage.java:26-32`): `encrypted`, `header`, `sid`, `key`, `rid`, `iv`, `payload`.

- `<encrypted xmlns='eu.siacs.conversations.axolotl'>`
- `<header sid='<senderDeviceId>'>` — `sid` = sender's own libsignal device/registration id
- `<key rid='<recipientDeviceId>' [prekey='true']>BASE64</key>` — one per recipient device (and per sender's own other devices)
- `<iv>BASE64(12 bytes)</iv>` — **inside `<header>`**, after the keys
- `</header>`
- `<payload>BASE64(ciphertext)</payload>` — sibling of `<header>`, optional (omitted for key-transport, see §5f)

### `prekey` attribute value
- **On send:** literal string `prekey="true"` (the production path `XmppAxolotlMessage.toElement()` hardcodes `"true"`).
- **On receive:** `Element.getAttributeAsBoolean("prekey")` accepts `"true"` OR `"1"` (case-insensitive) → both parse as prekey (`xml/Element.java:208-211`).
- Note: the *newer* model class `axolotl/Key.setIsPreKey()` would serialize `"1"` (because `Element.setAttribute(name, boolean)` writes `"1"/"0"`), but **that class is not used for outgoing chat messages** in 2.20.1 — `XmppAxolotlMessage.toElement()` is. So **expect `prekey="true"` from Conversations**, but accept `"1"` too for safety.
- Absent attribute = not a prekey message.

### Concrete XML (1:1 OMEMO chat message — full stanza)
```xml
<message to='contact@example.org' type='chat' id='<uuid>' from='me@example.org/res'>
  <encrypted xmlns='eu.siacs.conversations.axolotl'>
    <header sid='259621608'>
      <key rid='1641352234' prekey='true'>BASE64_PREKEYSIGNALMESSAGE</key>
      <key rid='883457230'>BASE64_SIGNALMESSAGE</key>
      <key rid='584829741'>BASE64_SIGNALMESSAGE</key>   <!-- my own other device -->
      <iv>BASE64_12B</iv>
    </header>
    <payload>BASE64_AESGCM_CIPHERTEXT_WITHOUT_TAG</payload>
  </encrypted>
  <body>I sent you an OMEMO encrypted message but your client doesn’t seem to support that.</body>
  <encryption xmlns='urn:xmpp:eme:0' name='OMEMO' namespace='eu.siacs.conversations.axolotl'/>
  <store xmlns='urn:xmpp:hints'/>
  <request xmlns='urn:xmpp:receipts'/>
  <markable xmlns='urn:xmpp:chat-markers:0'/>
</message>
```
(Plain 1:1 sets the stanza `id` to the message UUID but does **not** add an explicit `<origin-id>` element — see §16.)

### Receive parsing
`XmppAxolotlMessage.java` private ctor (lines 45–85): reads `sid` from `<header>`, iterates header children: `<key>` → `(rid, base64-decoded bytes, prekey?)`; `<iv>` → decoded (rejects duplicate iv). `<payload>` is found via `findChildEnsureSingle(PAYLOAD, PEP_PREFIX)` and base64-decoded into `ciphertext`. `hasPayload()` = `ciphertext != null`.

---

## 4. CRYPTO DETAILS (exact)

### Payload cipher
`XmppAxolotlMessage.java`:
```java
private static final String KEYTYPE = "AES";              // line 34
private static final String CIPHERMODE = "AES/GCM/NoPadding"; // line 35
...
generator.init(128);                                       // line 114 -> AES-128 key (16 bytes)
...
final byte[] iv = new byte[12]; random.nextBytes(iv);     // lines 122-124 -> 12-byte IV
```

- **AES variant: AES-128-GCM.** Inner key length = **16 bytes** (`KeyGenerator.init(128)`).
- **IV length: 12 bytes** (`generateIv()` → `new byte[12]`).
- GCM tag length: **16 bytes** (128-bit, the JCE/BouncyCastle `AES/GCM/NoPadding` default; Conversations relies on the default and slices off exactly 16 bytes).

### Auth-tag relocation (THE key gotcha)
`Config.java:81`: `public static final boolean PUT_AUTH_TAG_INTO_KEY = true;` (default, always on).

`encrypt()` (lines 148–179): JCE GCM produces `ciphertext = realCiphertext || 16-byte tag`. Then:
```java
if (Config.PUT_AUTH_TAG_INTO_KEY && this.ciphertext != null) {
    this.authtagPlusInnerKey = new byte[16 + 16];                 // 32 bytes
    byte[] ciphertext = new byte[this.ciphertext.length - 16];    // strip tag
    System.arraycopy(this.ciphertext, 0, ciphertext, 0, ciphertext.length);
    System.arraycopy(this.ciphertext, ciphertext.length, authtagPlusInnerKey, 16, 16); // tag -> bytes[16..32)
    System.arraycopy(this.innerKey, 0, authtagPlusInnerKey, 0, this.innerKey.length);  // key -> bytes[0..16)
    this.ciphertext = ciphertext;                                 // payload = ciphertext WITHOUT tag
}
```

So the **32-byte "key material"** that is libsignal-encrypted per device is:
```
authtagPlusInnerKey = AES_KEY(16 bytes) || GCM_TAG(16 bytes)
```
and `<payload>` = **GCM ciphertext WITHOUT the trailing 16-byte tag**.

`addDevice()` (lines 193–203) feeds `authtagPlusInnerKey` (the 32-byte blob) into `session.processSending(...)` → `SessionCipher.encrypt(...)`. **What goes into libsignal `SessionCipher.encrypt()` as plaintext = the 32 bytes (16-byte AES key + 16-byte GCM tag).**

### Decrypt side (mirror)
`decrypt()` (lines 254–300): the per-device `<key>` decrypts to `key` (must be ≥ 32 bytes, else `OutdatedSenderException`). Then:
```java
final int authTagLength = key.length - 16;   // = 16 normally
byte[] newCipherText = new byte[ (key.length-16) + ciphertext.length ];
byte[] newKey = new byte[16];
System.arraycopy(ciphertext, 0, newCipherText, 0, ciphertext.length);              // payload
System.arraycopy(key, 16, newCipherText, ciphertext.length, authTagLength);        // re-append tag
System.arraycopy(key, 0, newKey, 0, 16);                                           // AES key = first 16 bytes
// then AES/GCM decrypt newCipherText with newKey + iv
```
i.e. it reconstructs `ciphertext || tag`, takes the AES key from the first 16 bytes of the decrypted key-blob, and uses bytes [16..] as the tag.

> **Backward-compat note:** if the decrypted key is exactly 16 bytes (old clients that left the tag on the payload), Conversations throws `OutdatedSenderException` ("Key did not contain auth tag"). So you **must** put the tag in the key blob (32 bytes) when sending to Conversations.

### Per-device `<key>` content = libsignal CiphertextMessage
`XmppAxolotlSession.processSending` (lines 150–162):
```java
CiphertextMessage ciphertextMessage = cipher.encrypt(outgoingMessage);
return new AxolotlKey(deviceId, ciphertextMessage.serialize(),
        ciphertextMessage.getType() == CiphertextMessage.PREKEY_TYPE);
```
- `<key>` content = base64 of `CiphertextMessage.serialize()` (a **WhisperMessage** / **PreKeyWhisperMessage**).
- `prekey="true"` iff `getType() == PREKEY_TYPE` (=3).

#### libsignal serialization (signal-protocol-java 2.6.2, protocol **v3**)
`CiphertextMessage`: `CURRENT_VERSION=3`, `WHISPER_TYPE=2`, `PREKEY_TYPE=3`.

**SignalMessage (WhisperMessage)** `serialize()` = `versionByte || protobuf || MAC[8]`:
- `versionByte = (CURRENT_VERSION << 4) | CURRENT_VERSION = 0x33` for a v3↔v3 session. (`ByteUtil.intsToByteHighAndLow(messageVersion, CURRENT_VERSION)` → high nibble = msg version, low nibble = current version.)
- **MAC = 8 bytes**, truncated HMAC-SHA256 over `version || protobuf` keyed with the message keys (sender+receiver identity keys mixed in). `MAC_LENGTH = 8`.
- protobuf `SignalMessage` fields: `ratchetKey = 1` (bytes, the 33-byte sender ratchet pubkey), `counter = 2` (uint32), `previousCounter = 3` (uint32), `ciphertext = 4` (bytes).

**PreKeySignalMessage (PreKeyWhisperMessage)** `serialize()` = `versionByte || protobuf` (no outer MAC; the embedded `message` is a SignalMessage which has its own MAC):
- `versionByte = 0x33` (v3).
- protobuf `PreKeySignalMessage` fields: `registrationId = 5` (uint32), `preKeyId = 1` (uint32, optional), `signedPreKeyId = 6` (uint32), `baseKey = 2` (bytes, 33-byte), `identityKey = 3` (bytes, 33-byte), `message = 4` (bytes, the serialized SignalMessage).

> A new client SHOULD use a real libsignal/libomemo implementation for these bytes. The field numbers above let you sanity-check on the wire. Confirm first byte `0x33` and the trailing 8-byte HMAC on WhisperMessages.

### Padding
`Config.java:80`: `OMEMO_PADDING = false` (default). So **no whitespace padding** is applied to the plaintext before AES-GCM. (`getPaddedBytes()` exists but is gated off.) On decrypt, `.trim()` is only applied if `OMEMO_PADDING` is true — so **do not trim**; send the exact plaintext bytes. (If you do choose to pad on your side, Conversations will display the padding because it won't trim. Recommendation: don't pad.)

### Plaintext = UTF-8 of the body / file URL
`AxolotlService.encrypt(Message)` (lines 1613–1638): the plaintext is `message.getBody()`, or for files `message.getFileParams().url` (the `aesgcm://...` URL). It is encrypted directly (`plaintext.getBytes()` = platform default charset, effectively UTF-8 on Android).

---

## 5. f) Empty OMEMO message (KeyTransportMessage / heartbeat)

`generator/MessageGenerator.java::generateKeyTransportMessage` (lines 81–90):
```java
packet.setType(Message.Type.CHAT);
packet.setTo(to);
packet.setAxolotlMessage(axolotlMessage.toElement());
packet.addChild(new Store());      // <store xmlns='urn:xmpp:hints'/>
```
- `<payload>` is **omitted** (the `XmppAxolotlMessage` is built but `encrypt()` is not called, so `ciphertext == null` → `toElement()` skips `<payload>`). The `<key>` blobs still carry the 16-byte AES key + (no tag, since there's no payload — the key blob is just the 16-byte inner key, because `authtagPlusInnerKey` is null when `encrypt()` wasn't run → `addDevice` sends plain `innerKey`).
- **No `<body>`, no EME, no receipt request, no markable.** Just `<encrypted>` + `<store>`.
- Used to establish/heal sessions and deliver a fresh ratchet key (e.g. after building a session, or in response to a broken session). On receive, `MessageParser.parseAxolotlChat` detects `!hasPayload()` → `processReceivingKeyTransportMessage` ("received OMEMO key transport message", `MessageParser.java:140-141`).

> **Interop note:** A KeyTransport message has `<key>` blobs of 16 bytes (key only, no tag). Conversations' `decrypt()` requires ≥32 bytes, but KeyTransport messages go through `getParameters()`/`processReceivingKeyTransportMessage`, **not** `decrypt()`, so the 16-byte rule does not apply to them. When you send a KeyTransport message, put just the 16-byte key (or any agreed ratchet payload) in the encrypted blob and **omit `<payload>`**.

---

## 6. Trust model on the wire

`AxolotlService.buildHeader(XmppAxolotlMessage, Conversation)` (lines 1576–1593):
```java
Set<XmppAxolotlSession> remoteSessions = findSessionsForConversation(c);
Collection<XmppAxolotlSession> ownSessions = findOwnSessions();
if (remoteSessions.isEmpty() && !acceptEmpty) return false;
for (XmppAxolotlSession session : remoteSessions) axolotlMessage.addDevice(session);
for (XmppAxolotlSession session : ownSessions)    axolotlMessage.addDevice(session);
```
- Conversations encrypts to **all of the recipient's devices** (sessions for the contact's bare JID / for MUC: all member JIDs) **AND all of the sender's own other devices** (`findOwnSessions()`), so the sender can read the message on their other clients. The sender's *current* sending device is not in `<key>` (you don't encrypt to yourself).
- `addDevice` → `session.processSending(..., ignoreSessionTrust=false)`. In `XmppAxolotlSession.processSending` (lines 150–162): a `<key>` is added **only if** `status.isTrustedAndActive()`. **Untrusted or inactive devices are silently skipped** (no `<key>` for them).
- **Blind Trust Before Verification (BTBV)** is **on by default** (`AppSettings.BLIND_TRUST_BEFORE_VERIFICATION = "btbv"`, default `R.bool.btbv` = true). In `SQLiteAxolotlStore.saveIdentity` (lines 209–240): a newly seen identity key is stored as `createActiveTrusted()` **iff** BTBV is on AND there is **no already-verified key** for that JID; otherwise `createActiveUndecided()`. Once any key for a JID is manually verified, BTBV stops and new keys become *undecided* (not auto-trusted).
  - **Undecided** keys (BTBV off, or after a verified key exists) are **active but not trusted** → `isTrustedAndActive()` is false → **no `<key>` is generated for them**, and the UI prompts the user to decide. So on the wire: undecided/untrusted devices are simply absent from `<header>`.
- Devices it can't build a session with (bundle fetch failed) are skipped — it fetches bundles first (`createSessionsIfNeeded`), then encrypts to whatever sessions exist.
- **Implication for your client:** to be readable by Conversations under default BTBV, just publish a valid bundle and device-list entry; the first message will blind-trust you. But if the Conversations user has *ever verified* a key for your JID, your *new* device will be untrusted and **excluded** until the user taps to trust it — your messages to that user may come back undecryptable for some of their devices until then. Always encrypt to *all* their announced devices regardless of your local trust (Conversations relies on the recipient's UI, not the sender's, to gate display).

---

## 7. MUC + OMEMO

- **Targeting:** `AxolotlService.getCryptoTargets` (lines 966–972):
  ```java
  if (MODE_SINGLE) return ImmutableSet.of(conversation.getAddress().asBareJid());
  else return conversation.getMucOptions().getMembers();   // real bare JIDs of affiliated members
  ```
  In a MUC, recipients are the **real bare JIDs** of each member; for each JID, all that JID's OMEMO devices are added (`findSessionsForConversation` iterates `getAcceptedCryptoTargets()`).
- **Room requirements:** OMEMO MUC only works in **non-anonymous, members-only** rooms, because Conversations needs every occupant's **real JID**. It learns real JIDs from MUC presence `<x xmlns='http://jabber.org/protocol/muc#user'><item jid='real@jid'.../>` (affiliations / occupant presence) — i.e. the room must expose real JIDs (`muc_nonanonymous`) and be members-only so the member list is enumerable.
- **Stanza:** the group OMEMO message is a normal `<message type='groupchat' to='room@conference'>` carrying the same `<encrypted>` element, addressed to the **room bare JID** (`MessageGenerator.preparePacket`: `setTo(counterpart.asBareJid())`, `type=groupchat`). It includes `<store/>`, EME, and an `<origin-id>` (unless the room has stable IDs). **No receipt request / markable** for groupchat type. The single encrypted blob has one `<key rid=..>` per device of every member (plus the sender's own other devices).
- **MUC private message (PM) + OMEMO:** `buildHeader(XmppAxolotlMessage, Jid)` (lines 1596–1610) uses the single occupant's real JID (`getTrueCounterpart()`), type=chat, with `<x xmlns='http://jabber.org/protocol/muc#user'/>` and a receipt request.

---

## 8. `aesgcm://` media (OMEMO-encrypted file transfer)

### Encryption + URL fragment
`http/HttpUploadConnection.java` (lines 127–134):
```java
if (Config.ENCRYPT_ON_HTTP_UPLOADED || message.getEncryption() == Message.ENCRYPTION_AXOLOTL) {
    final var keyIv = new byte[44];          // 12-byte IV + 32-byte key
    SECURE_RANDOM.nextBytes(keyIv);
    transportSecurity = TransportSecurity.ofKeyAndIv(keyIv);
}
final long totalSize = originalFileSize + (transportSecurity != null ? 16 : 0);   // +16 GCM tag on the blob
```
`model/TransportSecurity.java`:
```java
public static TransportSecurity ofKeyAndIv(final byte[] keyIv) {  // length 44
    final var key = new byte[32];
    final var iv  = new byte[12];
    System.arraycopy(keyIv, 0, iv, 0, 12);     // bytes [0..12)  = IV
    System.arraycopy(keyIv, 12, key, 0, 32);   // bytes [12..44) = KEY
}
public byte[] asBytes() { return Bytes.concat(this.iv, this.key); }  // IV || KEY
```

- **File cipher: AES-256-GCM** (32-byte key!) — **different from the 128-bit key used for OMEMO message payloads.**
- **IV: 12 bytes** for newly-generated uploads.
- The encrypted blob = `AES-256-GCM(file)` with the 16-byte tag **left appended** on the blob (note `totalSize = fileSize + 16`). (Unlike message payloads, the file tag stays on the ciphertext.)
- **URL fragment** = `CryptoHelper.bytesToHex(transportSecurity.asBytes())` = **hex( IV(12) || KEY(32) )** = **88 hex chars** (lowercase).

`http/AesGcmURL.java`:
```java
public static final Pattern IV_KEY = Pattern.compile("([A-Fa-f0-9]{2}){48}|([A-Fa-f0-9]{2}){44}");
public static final String PROTOCOL_NAME = "aesgcm";
public static String toAesGcmUrl(HttpUrl url) {   // replaces "https" -> "aesgcm"
    return url.isHttps() ? PROTOCOL_NAME + url.toString().substring(5) : url.toString();
}
```
- Scheme becomes `aesgcm://` (https URL with scheme swapped). Download swaps it back to `https`.
- **Accepted fragment lengths on receive:** 44 bytes (`12B IV || 32B KEY`, 88 hex) **or** 48 bytes (`16B IV || 32B KEY`, 96 hex). `TransportSecurity.of()` handles both: for 48 it reads `iv=anchor[0..16)`, `key=anchor[16..48)`; for 44 it uses the 12/32 split. So **always key = 32 bytes (AES-256)**; the IV is 12 or 16 bytes depending on producer. Conversations **produces** the 44-byte (12-byte IV) form.

### How the URL is shared
- **Plain (non-OMEMO) file:** `MessageGenerator.generateChat` (lines 92–104): the `aesgcm://...#<hex>` URL is set as **both** `<body>` and `<x xmlns='jabber:x:oob'><url>...</url></x>`.
  ```xml
  <message type='chat' to='contact@example.org' id='<uuid>'>
    <body>aesgcm://upload.example.org/AbCd/image.jpg#<88 hex chars></body>
    <x xmlns='jabber:x:oob'><url>aesgcm://upload.example.org/AbCd/image.jpg#<88 hex chars></url></x>
    <request xmlns='urn:xmpp:receipts'/>
    <markable xmlns='urn:xmpp:chat-markers:0'/>
    <origin-id xmlns='urn:xmpp:sid:0' id='<uuid>'/>
  </message>
  ```
- **OMEMO file:** `AxolotlService.encrypt(Message)` sets `content = message.getFileParams().url` (the `aesgcm://...#<hex>` URL) and OMEMO-encrypts **that URL string** as the `<payload>`. So for OMEMO the URL travels **inside the encrypted payload**, and the outgoing stanza is a normal OMEMO chat message (with the fallback `<body>`, EME, `<store/>`). **No cleartext OOB `<x>` is added for OMEMO files** (`generateAxolotlChat` does not add OOB). The receiver decrypts the payload, sees an `aesgcm://` URL, downloads, and AES-256-GCM-decrypts using the fragment.

> **TRAP:** two different AES key sizes coexist — **AES-128-GCM** for OMEMO message payloads (16-byte key, tag moved into the per-device key blob), but **AES-256-GCM** for `aesgcm://` file blobs (32-byte key, tag left on the blob, 12-byte IV, fragment = hex(IV‖KEY)).

---

## 9. Message wrapping for OMEMO chat (hints/EME/fallback)

`generator/MessageGenerator.java::generateAxolotlChat` (lines 66–79):
```java
packet.setAxolotlMessage(axolotlMessage.toElement());                 // <encrypted>
packet.setBody(OMEMO_FALLBACK_MESSAGE);                               // body fallback text
packet.addExtension(new Store());                                     // <store xmlns='urn:xmpp:hints'/>
packet.addChild("encryption", "urn:xmpp:eme:0")
      .setAttribute("name", "OMEMO")
      .setAttribute("namespace", AxolotlService.PEP_PREFIX);          // EME
```
- **Fallback body** (line 19): `"I sent you an OMEMO encrypted message but your client doesn’t seem to support that."` (note the curly apostrophe `’`).
- **`<store xmlns='urn:xmpp:hints'/>`** is always added (so MAM/offline keeps it).
- **EME:** `<encryption xmlns='urn:xmpp:eme:0' name='OMEMO' namespace='eu.siacs.conversations.axolotl'/>`.
- From `preparePacket` (lines 28–63), for **1:1** (`MODE_SINGLE`, non-self): `type=chat`, `<request xmlns='urn:xmpp:receipts'/>`; plus `<markable xmlns='urn:xmpp:chat-markers:0'/>` when `isSingleOrPrivateAndNonAnonymous()`. The stanza `id` is set to the message UUID. An explicit `<origin-id>` element is added **only** for MODE_MULTI without stable IDs — **not** for plain 1:1 (see §16). `id` = the message UUID.

---

## 10. Reactions (XEP-0444)

`xml/Namespace.java:20`: `REACTIONS = "urn:xmpp:reactions:0"`.
`xmpp/manager/ReactionManager.java::reaction` (lines 218–238) + models `reactions/Reactions.java`, `reactions/Reaction.java` (both `@XmlPackage(namespace=REACTIONS)`):
```java
final var reactions = packet.addExtension(new Reactions());
reactions.setId(reactingTo);                 // <reactions id='...'>
for (String r : ourReactions)
    reactions.addExtension(new Reaction(r)); // <reaction>👍</reaction>
packet.addExtension(new Store());            // <store xmlns='urn:xmpp:hints'/>
```
- Element: `<reactions xmlns='urn:xmpp:reactions:0' id='<target-id>'>` containing zero or more `<reaction>EMOJI</reaction>`.
- **Removal:** send `<reactions id=..>` with **no `<reaction>` children** (empty set replaces the full set — XEP-0444 "full state" semantics). `sendReactions` always sends the complete current reaction set for that user.
- **Only emoji** are accepted on receive (`Reactions.getReactions()` filters via `EmojiManager.isEmoji`). Non-emoji reactions are dropped.

### Which id is referenced (1:1 vs MUC) — `sendReactions` (lines 142–205)
- **MUC (groupchat, not PM):** `reactToId = message.getServerMsgId()` (the **stanza-id**, XEP-0359 `<stanza-id>` assigned by the room). `reactTo = room bare JID`, `type=groupchat`. Sender must have an occupant-id.
- **1:1:** `reactToId = message.getRemoteMsgId()` if the message was received/carbon, else `message.getUuid()` (your own origin-id/message id). `reactTo = contact bare JID`, `type=chat`.
- **MUC PM:** `reactTo = message.getCounterpart()` (occupant full JID), type=chat, references the message's stored id; validated via occupant-id.

### Receive (`processReactions`, lines 30–140)
- groupchat → look up target by `serverMsgId` (stanza-id); requires `<occupant-id>` (XEP-0421) on the reaction to attribute it.
- 1:1 → look up by `findMessageWithUuidOrRemoteId(reactingTo)`.

---

## 11. Message Retraction (XEP-0424) + Fallback (XEP-0428)

- `xml/Namespace.java:121`: `RETRACTION = "urn:xmpp:message-retract:1"` (the `:1` version).
- `xml/Namespace.java:134`: `FALLBACK_INDICATION = "urn:xmpp:fallback:0"`.
- Models: `retraction/Retract.java` (`@XmlElement`, ns `urn:xmpp:message-retract:1`, attribute `id`), `fallback/Fallback.java` (ns `urn:xmpp:fallback:0`, attribute `for`).

> **IMPORTANT — Conversations 2.20.1 does NOT send user-initiated XEP-0424 retractions for normal chat messages.** The only outbound `Retract` usages are:
> - **MUC moderation** (XEP-0425): `xmpp/manager/ModerationManager.java:70-71` wraps `<retract xmlns='urn:xmpp:message-retract:1'/>` inside `<moderate xmlns='urn:xmpp:message-moderate:1' id='...'>` in an IQ to the room — this is moderator deletion, not self-retraction.
> - **Jingle Message Initiation** (`JingleMessageManager.java:188` `new Retract(sessionId)`) — that's the JMI `<retract>` (ns `urn:xmpp:jingle-message:0`), unrelated to message-retract.
>
> Conversations **parses/handles incoming** retraction (`ModerationManager.handleRetraction`, parser dispatch) — i.e. it will honor a retraction sent to it — but does not author standalone message retractions in this version. The `<fallback>` model exists and is honored on receive (used for reply/quote fallback stripping), but there is no code emitting a retraction `<fallback>` body for chat. **Plan accordingly: if your client sends XEP-0424 `<retract id=..>` in a `<message>`, modern Conversations should process it (it understands ns `:1`); test against your target build.**

Retraction element form (for what Conversations understands on the wire):
```xml
<message type='chat' to='contact@example.org' id='retract-uuid'>
  <retract id='<origin-id-or-stanza-id-of-target>' xmlns='urn:xmpp:message-retract:1'/>
  <fallback xmlns='urn:xmpp:fallback:0' for='urn:xmpp:message-retract:1'/>
  <body>This person attempted to retract a previous message, but it's unsupported by your client.</body>
  <store xmlns='urn:xmpp:hints'/>
</message>
```
(Use stanza-id for MUC, origin-id/id for 1:1 — same id rules as reactions.)

---

## 12. Replies (XEP-0461)

> **Conversations 2.20.1 has no XEP-0461 `<reply>` implementation.** There is no `reply`/`replies` model class and no `urn:xmpp:reply:0` namespace constant. "Replies/quotes" in Conversations are rendered/sent as **plaintext quotation** (lines beginning with `> ` in the body), not as a structured `<reply to=.. id=..>` element. The `<fallback>` (XEP-0428) machinery is present for *stripping* fallback ranges on **incoming** messages from other clients, but Conversations does not author `<reply>`+`<fallback>`.
>
> **Interop:** if you send XEP-0461 `<reply xmlns='urn:xmpp:reply:0' to='...' id='...'/>` with a `<fallback for='urn:xmpp:reply:0'>` body, Conversations will fall back to showing the body (and may strip the fallback range if the `for` matches a registered extension — but reply isn't registered, so it'll show the quote text in the body). For reliable quoting **to** Conversations, prepend a `> quoted line\n` style quote in the body.

---

## 13. Last Message Correction (XEP-0308)

- `xml/Namespace.java:14`: `LAST_MESSAGE_CORRECTION = "urn:xmpp:message-correct:0"`.
- Model `correction/Replace.java` (`@XmlElement(namespace="urn:xmpp:message-correct:0")`, attribute `id`).
- `MessageGenerator.preparePacket` (lines 60–62):
  ```java
  if (message.edited()) {
      packet.addExtension(new Replace(message.getEditedIdWireFormat()));
  }
  ```
- Element: `<replace id='<id-of-message-being-corrected>' xmlns='urn:xmpp:message-correct:0'/>`. The corrected message is a normal new `<message>` (new id) carrying the new body (or new `<encrypted>` for OMEMO) plus `<replace>`.
- **Which id:** `getEditedIdWireFormat()` — for 1:1 the original message's id/origin-id; for MUC the original's id as the room/occupant sees it. Correction works for OMEMO messages too (the new stanza is generated via the same `preparePacket`, so `<replace>` sits alongside `<encrypted>`).

---

## 14. Chat Markers (XEP-0333), Receipts (XEP-0184), Chat States (XEP-0085)

### Receipts (XEP-0184) — `urn:xmpp:receipts`
- Models `receipts/Request.java`, `receipts/Received.java` (ns `urn:xmpp:receipts`).
- **Request:** added to **1:1** chat/PM outgoing messages: `<request xmlns='urn:xmpp:receipts'/>` (`MessageGenerator.java:39,45`). **Not** added to `type=groupchat`.
- **Send receipt:** `DeliveryReceiptManager.received` (lines 72–79):
  ```xml
  <message to='sender@example.org' type='chat'>   <!-- type mirrors original; NORMAL by default -->
    <received xmlns='urn:xmpp:receipts' id='<original-stanza-id>'/>
    <store xmlns='urn:xmpp:hints'/>
  </message>
  ```
  References the **original message's `id`** (`packet.getId()` → `remoteMsgId`).

### Chat Markers (XEP-0333) — `urn:xmpp:chat-markers:0`
- Models `markers/Markable.java`, `markers/Displayed.java`, `markers/Received.java` (ns `urn:xmpp:chat-markers:0`).
- **Markable:** `<markable xmlns='urn:xmpp:chat-markers:0'/>` added to outgoing 1:1 and **private-and-non-anonymous** MUC messages (`MessageGenerator.java:50-52`, `isSingleOrPrivateAndNonAnonymous()`).
- **Displayed marker:** `DisplayedManager.displayedMessage` (lines 190–208):
  ```java
  final var displayed = packet.addExtension(new Displayed());
  if (groupChat) displayed.setId(message.getServerMsgId());   // MUC -> stanza-id
  else           displayed.setId(message.getRemoteMsgId());   // 1:1 -> message id
  packet.addExtension(new Store());
  ```
  ```xml
  <message to='contact@example.org' type='chat'>
    <displayed xmlns='urn:xmpp:chat-markers:0' id='<id>'/>
    <store xmlns='urn:xmpp:hints'/>
  </message>
  ```
  - **1:1:** `<displayed id=remoteMsgId>` (the message `id`), type=chat.
  - **MUC:** `<displayed id=serverMsgId>` (the **stanza-id**), type=groupchat, sent to room bare JID.
  - Only the **last** read message's marker is sent (chat-markers "displayed" implies all prior read). Gated by `appSettings.isReadReceipts()` and trust.
  - Conversations does **not** send a `<received>` *chat-marker* (it uses XEP-0184 `<received>` for delivery and XEP-0333 only for `displayed`).
- MDS (XEP-0490 Message Displayed Synchronization) is also published when server-assisted (`MessageDisplayedSynchronizationManager`), but that's PEP, not on the chat stanza.

### Chat States (XEP-0085) — `http://jabber.org/protocol/chatstates`
- Models `state/Active.java`, `Composing.java`, `Paused.java`, `Inactive.java`, `Gone.java` (sealed `ChatStateNotification`, ns `http://jabber.org/protocol/chatstates`).
- Sent as a child of the message: e.g. `<composing xmlns='http://jabber.org/protocol/chatstates'/>`. Outgoing user messages typically carry `<active/>`. Standalone notifications carry `<composing/>`/`<paused/>`/etc. (`ChatStateManager`). Gated by `appSettings.isSendChatStates()`.

---

## 15. HTTP File Upload (XEP-0363) — slot request

`xmpp/manager/HttpUploadManager.java` + model `upload/Request.java` (ns `urn:xmpp:http:upload:0`):
```xml
<iq type='get' to='upload.example.org' id='...'>
  <request xmlns='urn:xmpp:http:upload:0' filename='image.jpg' size='12345' content-type='image/jpeg'/>
</iq>
```
- Namespace `urn:xmpp:http:upload:0`. Element `<request>` with attributes `filename`, `size`, `content-type`.
- The upload service is discovered via disco (`DiscoManager.findDiscoItemByFeature(Namespace.HTTP_UPLOAD)`).
- The `<slot>` response provides `<put url=..>` (with `<header>` allow-list) and `<get url=..>`; Conversations PUTs the (optionally encrypted) bytes, then shares the `get` URL per §8.
- For OMEMO/encrypted uploads the uploaded size is `fileSize + 16` (AES-256-GCM tag appended to the blob).

---

## 16. origin-id / stanza-id (XEP-0359) and id usage

- `xml/Namespace.java:44`: `STANZA_IDS = "urn:xmpp:sid:0"`.
- **origin-id:** `MessageGenerator.preparePacket` (lines 55–59) adds `<origin-id xmlns='urn:xmpp:sid:0' id='<uuid>'/>` **only** when `MODE_MULTI && !privateMessage && !mucOptions.stableId()` (i.e. group chat in a room that does not provide stable/server-assigned ids). For **plain 1:1 there is NO explicit `<origin-id>` element** — Conversations just sets the stanza `id` to its message UUID (`packet.setId(message.getUuid())`, line 54). So when correlating 1:1 messages from Conversations, key off the message `id` attribute (which is the sender's UUID); for MUC, prefer the `<origin-id>` (when present) and the server's `<stanza-id>`.
- **stanza-id:** assigned by the server/MUC (`<stanza-id xmlns='urn:xmpp:sid:0' id=.. by=..>`), read as `serverMsgId`.

### Which id is referenced where (the decision table)
| Feature | 1:1 references | MUC references |
|---|---|---|
| Reaction `<reactions id>` | `remoteMsgId` (recv) / `uuid` (own) | `serverMsgId` (**stanza-id**) |
| Displayed marker `<displayed id>` | `remoteMsgId` (message `id`) | `serverMsgId` (**stanza-id**) |
| Delivery receipt `<received id>` | original message `id` | n/a (no receipts in groupchat) |
| Correction `<replace id>` | original `id`/origin-id | original id as seen in room |
| (Retraction `<retract id>` — incoming) | `id`/origin-id | `serverMsgId` (stanza-id) |

> **TRAP:** In MUC, **always reference the server-assigned `stanza-id`** (XEP-0359), not your origin-id, for reactions/markers/retractions. In 1:1, reference the message `id` (which equals the sender's origin-id/UUID). Mixing these up makes Conversations fail to correlate the target message.

---

## 17. Avatars (brief)

- XEP-0084 (`urn:xmpp:avatar:metadata` / `:data`) and vCard-temp avatars are both supported. Avatar publishing uses PEP `urn:xmpp:avatar:data` (base64 PNG) + `urn:xmpp:avatar:metadata` (`<info id=<sha1> type=.. bytes=.. width=.. height=..>`). vCard-temp (`<vCard xmlns='vcard-temp'><PHOTO>`) is used as fallback/legacy and for MUC. (Not central to OMEMO interop; implement XEP-0084 PEP for modern avatars, vCard-temp for legacy/MUC.)

---

# GOTCHAS / INTEROP TRAPS (top issues a new client gets wrong)

1. **Namespace is legacy, not omemo:2.** Use `eu.siacs.conversations.axolotl` everywhere (devicelist node `…axolotl.devicelist`, bundle node `…axolotl.bundles:<deviceId>`, `<encrypted xmlns='…axolotl'>`, EME `namespace='…axolotl'`). Conversations ignores `urn:xmpp:omemo:2` entirely.

2. **Auth tag is moved into the key blob.** What you libsignal-encrypt per device is **32 bytes = 16-byte AES key ‖ 16-byte GCM tag**. `<payload>` is the GCM ciphertext **WITHOUT** the tag. If you leave the tag on the payload and put only the 16-byte key in `<key>`, Conversations throws `OutdatedSenderException` and refuses to decrypt. On receive, you must split the decrypted 32-byte blob: `key = blob[0..16)`, `tag = blob[16..32)`, then GCM-decrypt `payload ‖ tag`.

3. **AES-128, not AES-256, for message payloads; 12-byte IV.** `KeyGenerator.init(128)` → 16-byte key; IV is 12 bytes. (Don't copy the 256-bit/CBC parameters from the modern XEP.) Tag = 16 bytes.

4. **Public keys are 33 bytes (0x05-prefixed), base64'd.** `identityKey`, `signedPreKeyPublic`, every `preKeyPublic`, and the libsignal protobuf `baseKey`/`identityKey`/`ratchetKey` are all the 33-byte serialized form. Prepend `0x05` to raw 32-byte X25519 keys before base64; strip it (offset 1) when importing. The historical XEP-0384 0.3.0 examples show 32 bytes — the code uses 33. Match the code.

5. **`prekey="true"` (literal string), and it lives on `<key>`.** Conversations sends `prekey="true"`; it accepts `"true"` or `"1"` on receive. The `<key prekey>` content for a fresh session is a **PreKeyWhisperMessage** (libsignal `getType()==PREKEY_TYPE`); thereafter a **WhisperMessage**. First serialized byte is `0x33` (v3); WhisperMessages end with an **8-byte** truncated HMAC.

6. **Encrypt to ALL recipient devices AND all of your own other devices.** Conversations always adds `<key rid>` for every trusted-active device of every target, plus `findOwnSessions()` (your other devices) so you can read your own sent message. Omitting your own devices means your message won't appear on your other clients.

7. **Sender-side trust silently drops devices (BTBV default on).** `processSending` only emits a `<key>` for `isTrustedAndActive()` sessions. New keys are blind-trusted only if **no verified key exists** for that JID; otherwise they're "undecided" → excluded until the user taps trust. Always still encrypt to every device *you* can (publish your bundle so they blind-trust you); recipient-side UI gates display.

8. **`<iv>` goes INSIDE `<header>`, after the `<key>` elements; `<payload>` is a sibling of `<header>`.** Element/attr names are exact and case-sensitive: `encrypted`, `header`, `sid`, `key`, `rid`, `iv`, `payload`. `sid`/`rid` are integers (libsignal registration ids).

9. **KeyTransport / empty messages omit `<payload>`** and carry only `<encrypted>` + `<store/>` (no body, no EME, no receipt). The `<key>` blobs then carry just the 16-byte key (no tag, since there's no payload). Handle "no payload" as a session/heartbeat message, not an error.

10. **Two different file-crypto parameters.** `aesgcm://` uploads use **AES-256-GCM** (32-byte key), **12-byte IV**, tag **left on the blob** (uploaded size = file+16). The URL **fragment = hex(IV ‖ KEY)** = 88 hex chars (accept 96 too: 16-byte IV variant). Don't reuse the OMEMO-message 128-bit/tag-in-key scheme for files.

11. **OMEMO file URLs travel inside the encrypted payload; plain file URLs go in body + OOB.** For OMEMO, the `aesgcm://…#hex` URL is the plaintext that gets OMEMO-encrypted (no cleartext OOB). For non-OMEMO, the URL is duplicated in `<body>` and `<x xmlns='jabber:x:oob'><url>`.

12. **In MUC reference the stanza-id (XEP-0359), in 1:1 the message id.** Reactions/displayed-markers/retractions target `serverMsgId` (the room's `<stanza-id>`) in groupchat, but the message `id`/origin-id in 1:1. OMEMO MUC requires a **non-anonymous, members-only** room so real JIDs of all occupants are known; encrypt to each member's real-JID devices. Also: device-list publishing is **read-modify-write of the whole `<list>`** (single item id `current`) — fetch existing ids, add yours, republish all, or you'll wipe siblings. publish-options sets only `pubsub#access_model=open`.

---

## Appendix: exact constants quick-reference

| Thing | Value | Source |
|---|---|---|
| OMEMO namespace | `eu.siacs.conversations.axolotl` | AxolotlService.java:74 |
| Device-list node | `eu.siacs.conversations.axolotl.devicelist` | :75 |
| Bundle node | `eu.siacs.conversations.axolotl.bundles:<deviceId>` | :77, IqGenerator:117 |
| PEP item id | `current` | IqGenerator:78,95 |
| Payload cipher | AES/GCM/NoPadding, 128-bit key | XmppAxolotlMessage:34-35,114 |
| IV length (message) | 12 bytes | XmppAxolotlMessage:123 |
| GCM tag | 16 bytes, moved into key blob | XmppAxolotlMessage:162-169 |
| Key blob to libsignal | 32 bytes = key(16)‖tag(16) | :163-167 |
| PUT_AUTH_TAG_INTO_KEY | true | Config.java:81 |
| OMEMO_PADDING | false | Config.java:80 |
| prekey attr | `prekey="true"` (accept "1") | XmppAxolotlMessage:221, Element:210 |
| Public key serialization | 33 bytes, `0x05 ‖ X25519` | DjbECPublicKey.serialize, Curve.DJB_TYPE=5 |
| signedPreKeySignature | 64 bytes (XEdDSA) | bundle |
| Prekeys published | 100 | AxolotlService.java:82 |
| libsignal | signal-protocol-java 2.6.2, protocol v3 (byte 0x33), MAC 8 bytes | build.gradle:87 |
| EME | `urn:xmpp:eme:0` name="OMEMO" | MessageGenerator:75-77 |
| OMEMO fallback body | "I sent you an OMEMO encrypted message but your client doesn’t seem to support that." | MessageGenerator:19 |
| Hint | `<store xmlns='urn:xmpp:hints'/>` always | MessageGenerator:74 |
| Reactions ns | `urn:xmpp:reactions:0` | Namespace:20 |
| Retraction ns | `urn:xmpp:message-retract:1` (recv/moderation only) | Namespace:121 |
| Fallback ns | `urn:xmpp:fallback:0` | Namespace:134 |
| Correction ns | `urn:xmpp:message-correct:0` | Namespace:14 |
| Chat markers ns | `urn:xmpp:chat-markers:0` | Namespace:16 |
| Chat states ns | `http://jabber.org/protocol/chatstates` | Namespace:17 |
| Receipts ns | `urn:xmpp:receipts` | Namespace:19 |
| stanza/origin-id ns | `urn:xmpp:sid:0` | Namespace:44 |
| HTTP Upload ns | `urn:xmpp:http:upload:0` | Namespace:42 |
| aesgcm file cipher | AES-256-GCM, 12-byte IV, tag on blob | HttpUploadConnection:129, TransportSecurity |
| aesgcm fragment | hex(IV(12) ‖ KEY(32)) = 88 hex | TransportSecurity.asBytes |
| Replies (XEP-0461) | NOT implemented (plaintext quotes) | (no model class) |
