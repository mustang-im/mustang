/** Signal pairwise session: X3DH key agreement + the Double Ratchet.
 * Implemented from the Signal specifications; constants per WhatsApp (v3). */
import { KeyPair } from "../KeyPair";
import { sharedSecret, djbEncode, djbDecode } from "../curve";
import { hkdfSHA256, hmacSHA256, aesCBCEncrypt, aesCBCDecrypt, randomBytes, concatBytes, bytesEqual } from "../primitives";
import { bytesToHex } from "@noble/curves/utils.js";
import type { SignalStore } from "./Store";
import { PreKeyBundle, verifyPreKeyBundle } from "./Identity";
import {
  serializeSignalMessage, parseSignalMessage, verifySignalMessageMAC,
  serializePreKeySignalMessage, parsePreKeySignalMessage,
} from "./messages";

export class SessionState {
  rootKey: Uint8Array;
  senderRatchetKeyPair: KeyPair;
  senderChainKey: Uint8Array;
  senderChainIndex = 0;
  previousCounter = 0;
  receiverChains = new Map<string, Chain>(); // ratchet pub hex -> chain
  theirRatchetKey?: Uint8Array; // 32 bytes
  skippedKeys = new Map<string, Uint8Array>(); // "ratchetHex:counter" -> messageKey
  remoteIdentityKey: Uint8Array; // 33-byte djb
  localIdentityKey: Uint8Array; // 33-byte djb
  pendingPreKey?: { preKeyID?: number, signedPreKeyID: number, baseKey: Uint8Array };
  remoteRegistrationID?: number;
}

export interface EncryptedSignalMessage {
  type: "pkmsg" | "msg";
  body: Uint8Array;
}

const kMaxSkip = 2000;
const enc = (s: string) => new TextEncoder().encode(s);
const kZero32 = new Uint8Array(32);
const kDiscontinuity = new Uint8Array(32).fill(0xFF);

interface Chain {
  chainKey: Uint8Array;
  index: number;
}

// --- key derivation ---

function deriveRootAndChain(secrets: Uint8Array): { rootKey: Uint8Array, chainKey: Uint8Array } {
  let out = hkdfSHA256(secrets, kZero32, enc("WhisperText"), 64);
  return { rootKey: out.slice(0, 32), chainKey: out.slice(32, 64) };
}

function kdfRootKey(rootKey: Uint8Array, dh: Uint8Array): { rootKey: Uint8Array, chainKey: Uint8Array } {
  let out = hkdfSHA256(dh, rootKey, enc("WhisperRatchet"), 64);
  return { rootKey: out.slice(0, 32), chainKey: out.slice(32, 64) };
}

function chainStep(chainKey: Uint8Array): { messageKey: Uint8Array, nextChainKey: Uint8Array } {
  return {
    messageKey: hmacSHA256(chainKey, new Uint8Array([1])),
    nextChainKey: hmacSHA256(chainKey, new Uint8Array([2])),
  };
}

function deriveMessageKeys(messageKey: Uint8Array): { cipherKey: Uint8Array, macKey: Uint8Array, iv: Uint8Array } {
  let out = hkdfSHA256(messageKey, kZero32, enc("WhisperMessageKeys"), 80);
  return { cipherKey: out.slice(0, 32), macKey: out.slice(32, 64), iv: out.slice(64, 80) };
}

// --- plaintext padding (WhatsApp: 1..15 trailing bytes, each = the count) ---

export function padPlaintext(plaintext: Uint8Array): Uint8Array {
  let pad = randomBytes(1)[0] & 0x0F;
  if (pad == 0) {
    pad = 0x0F;
  }
  let out = new Uint8Array(plaintext.length + pad);
  out.set(plaintext);
  out.fill(pad, plaintext.length);
  return out;
}

export function unpadPlaintext(padded: Uint8Array): Uint8Array {
  let pad = padded[padded.length - 1];
  if (pad == 0 || pad > padded.length) {
    return padded;
  }
  return padded.subarray(0, padded.length - pad);
}

// --- session setup ---

/** Starts a session as the initiator (Alice), from the peer's prekey bundle. */
export function initiateSession(store: SignalStore, address: string, bundle: PreKeyBundle): SessionState {
  if (!verifyPreKeyBundle(bundle)) {
    throw new Error("Invalid signed prekey signature in bundle");
  }
  let baseKey = KeyPair.generate(); // EK_a
  let secrets = [kDiscontinuity,
    sharedSecret(store.identityKeyPair.privateKey, bundle.signedPreKeyPublic), // DH1
    sharedSecret(baseKey.privateKey, bundle.identityKey), // DH2
    sharedSecret(baseKey.privateKey, bundle.signedPreKeyPublic)]; // DH3
  if (bundle.preKeyPublic) {
    secrets.push(sharedSecret(baseKey.privateKey, bundle.preKeyPublic)); // DH4
  }
  let { rootKey: rk0, chainKey: ck0 } = deriveRootAndChain(concatBytes(...secrets));
  let sendingRatchet = KeyPair.generate(); // DHs
  let sending = kdfRootKey(rk0, sharedSecret(sendingRatchet.privateKey, bundle.signedPreKeyPublic));

  let state = new SessionState();
  state.rootKey = sending.rootKey;
  state.senderRatchetKeyPair = sendingRatchet;
  state.senderChainKey = sending.chainKey;
  state.receiverChains.set(bytesToHex(bundle.signedPreKeyPublic), { chainKey: ck0, index: 0 });
  state.theirRatchetKey = bundle.signedPreKeyPublic;
  state.remoteIdentityKey = djbEncode(bundle.identityKey);
  state.localIdentityKey = djbEncode(store.identityKeyPair.publicKey);
  state.remoteRegistrationID = bundle.registrationID;
  state.pendingPreKey = { preKeyID: bundle.preKeyID, signedPreKeyID: bundle.signedPreKeyID, baseKey: djbEncode(baseKey.publicKey) };
  store.sessions.set(address, state);
  store.identities.set(address, bundle.identityKey);
  return state;
}

/** Starts a session as the responder (Bob), from an incoming PreKeySignalMessage. */
function createSessionFromPreKey(store: SignalStore, address: string, data: Uint8Array): SessionState {
  let pkmsg = parsePreKeySignalMessage(data);
  let signedPreKey = store.signedPreKeys.get(pkmsg.signedPreKeyID);
  if (!signedPreKey) {
    throw new Error(`Unknown signed prekey ${pkmsg.signedPreKeyID}`);
  }
  let oneTime = pkmsg.preKeyID != null ? store.preKeys.get(pkmsg.preKeyID) : undefined;
  let theirIdentity = djbDecode(pkmsg.identityKey);
  let theirBaseKey = djbDecode(pkmsg.baseKey);
  let secrets = [kDiscontinuity,
    sharedSecret(signedPreKey.keyPair.privateKey, theirIdentity), // DH1
    sharedSecret(store.identityKeyPair.privateKey, theirBaseKey), // DH2
    sharedSecret(signedPreKey.keyPair.privateKey, theirBaseKey)]; // DH3
  if (oneTime) {
    secrets.push(sharedSecret(oneTime.keyPair.privateKey, theirBaseKey)); // DH4
  }
  let { rootKey, chainKey } = deriveRootAndChain(concatBytes(...secrets));

  let state = new SessionState();
  state.rootKey = rootKey;
  state.senderRatchetKeyPair = signedPreKey.keyPair; // Bob's initial ratchet = SPK
  state.senderChainKey = chainKey;
  state.remoteIdentityKey = pkmsg.identityKey;
  state.localIdentityKey = djbEncode(store.identityKeyPair.publicKey);
  store.sessions.set(address, state);
  store.identities.set(address, theirIdentity);
  if (oneTime) {
    store.preKeys.delete(pkmsg.preKeyID!); // one-time prekeys are consumed once
  }
  return state;
}

// --- encrypt / decrypt ---

export async function encrypt(store: SignalStore, address: string, plaintext: Uint8Array): Promise<EncryptedSignalMessage> {
  let state = store.sessions.get(address);
  if (!state) {
    throw new Error(`No session for ${address}`);
  }
  let { messageKey, nextChainKey } = chainStep(state.senderChainKey);
  let counter = state.senderChainIndex;
  state.senderChainKey = nextChainKey;
  state.senderChainIndex++;
  let keys = deriveMessageKeys(messageKey);
  let ciphertext = await aesCBCEncrypt(keys.cipherKey, keys.iv, padPlaintext(plaintext));
  let signal = serializeSignalMessage({
    ratchetKey: djbEncode(state.senderRatchetKeyPair.publicKey),
    counter, previousCounter: state.previousCounter, ciphertext,
  }, keys.macKey, state.localIdentityKey, state.remoteIdentityKey);
  if (state.pendingPreKey) {
    let body = serializePreKeySignalMessage({
      registrationID: store.registrationID,
      preKeyID: state.pendingPreKey.preKeyID,
      signedPreKeyID: state.pendingPreKey.signedPreKeyID,
      baseKey: state.pendingPreKey.baseKey,
      identityKey: state.localIdentityKey,
      message: signal,
    });
    return { type: "pkmsg", body };
  }
  return { type: "msg", body: signal };
}

/** Decrypts a `pkmsg` (PreKeySignalMessage), establishing the session if needed. */
export async function decryptPreKeyMessage(store: SignalStore, address: string, data: Uint8Array): Promise<Uint8Array> {
  if (!store.sessions.has(address)) {
    createSessionFromPreKey(store, address, data);
  }
  let pkmsg = parsePreKeySignalMessage(data);
  return await decryptSignalMessage(store, address, pkmsg.message);
}

/** Decrypts a `msg` (SignalMessage) on an existing session. */
export async function decryptSignalMessage(store: SignalStore, address: string, data: Uint8Array): Promise<Uint8Array> {
  let state = store.sessions.get(address);
  if (!state) {
    throw new Error(`No session for ${address}`);
  }
  let parsed = parseSignalMessage(data);
  let theirRatchet = djbDecode(parsed.ratchetKey);
  if (!state.theirRatchetKey || !bytesEqual(state.theirRatchetKey, theirRatchet)) {
    if (state.theirRatchetKey) {
      skipReceiverKeys(state, bytesToHex(state.theirRatchetKey), parsed.previousCounter);
    }
    dhRatchet(state, theirRatchet);
  }
  let messageKey = getReceiverMessageKey(state, theirRatchet, parsed.counter);
  let keys = deriveMessageKeys(messageKey);
  if (!verifySignalMessageMAC(parsed, keys.macKey, state.remoteIdentityKey, state.localIdentityKey)) {
    throw new Error("Bad MAC on SignalMessage");
  }
  let plaintext = unpadPlaintext(await aesCBCDecrypt(keys.cipherKey, keys.iv, parsed.ciphertext));
  state.pendingPreKey = undefined; // the session is now confirmed by the peer
  return plaintext;
}

function dhRatchet(state: SessionState, theirRatchet: Uint8Array) {
  state.previousCounter = state.senderChainIndex;
  let receiving = kdfRootKey(state.rootKey, sharedSecret(state.senderRatchetKeyPair.privateKey, theirRatchet));
  state.receiverChains.set(bytesToHex(theirRatchet), { chainKey: receiving.chainKey, index: 0 });
  state.theirRatchetKey = theirRatchet;
  state.senderRatchetKeyPair = KeyPair.generate();
  let sending = kdfRootKey(receiving.rootKey, sharedSecret(state.senderRatchetKeyPair.privateKey, theirRatchet));
  state.rootKey = sending.rootKey;
  state.senderChainKey = sending.chainKey;
  state.senderChainIndex = 0;
}

function getReceiverMessageKey(state: SessionState, ratchet: Uint8Array, counter: number): Uint8Array {
  let ratchetHex = bytesToHex(ratchet);
  let skipKey = `${ratchetHex}:${counter}`;
  if (state.skippedKeys.has(skipKey)) {
    let mk = state.skippedKeys.get(skipKey)!;
    state.skippedKeys.delete(skipKey);
    return mk;
  }
  let chain = state.receiverChains.get(ratchetHex);
  if (!chain) {
    throw new Error("No receiver chain for ratchet key");
  }
  if (counter < chain.index) {
    throw new Error("Duplicate or too-old message");
  }
  if (counter - chain.index > kMaxSkip) {
    throw new Error("Too many skipped messages");
  }
  while (chain.index < counter) {
    let { messageKey, nextChainKey } = chainStep(chain.chainKey);
    state.skippedKeys.set(`${ratchetHex}:${chain.index}`, messageKey);
    chain.chainKey = nextChainKey;
    chain.index++;
  }
  let { messageKey, nextChainKey } = chainStep(chain.chainKey);
  chain.chainKey = nextChainKey;
  chain.index++;
  return messageKey;
}

function skipReceiverKeys(state: SessionState, ratchetHex: string, untilCounter: number) {
  let chain = state.receiverChains.get(ratchetHex);
  if (!chain) {
    return;
  }
  while (chain.index < untilCounter && untilCounter - chain.index <= kMaxSkip) {
    let { messageKey, nextChainKey } = chainStep(chain.chainKey);
    state.skippedKeys.set(`${ratchetHex}:${chain.index}`, messageKey);
    chain.chainKey = nextChainKey;
    chain.index++;
  }
}
