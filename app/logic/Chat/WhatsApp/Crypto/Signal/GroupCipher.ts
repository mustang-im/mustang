/** Signal Sender Keys for group messaging. Each sender has a per-group chain
 * and an XEdDSA signing key; the chain is distributed to members over their
 * pairwise sessions via a SenderKeyDistributionMessage. */
import { KeyPair } from "../KeyPair";
import { djbEncode } from "../curve";
import { hkdfSHA256, hmacSHA256, aesCBCEncrypt, aesCBCDecrypt, randomBytes, base64Encode, base64Decode } from "../primitives";
import { padPlaintext, unpadPlaintext } from "./SessionCipher";
import {
  serializeSenderKeyMessage, parseSenderKeyMessage,
  serializeSenderKeyDistributionMessage, parseSenderKeyDistributionMessage,
} from "./messages";

const kMaxSkip = 2000;
const enc = (s: string) => new TextEncoder().encode(s);
const kZero32 = new Uint8Array(32);

export class SenderKeyState {
  keyID: number;
  chainKey: Uint8Array;
  chainIndex: number;
  /** For our own sender key: the signing key pair. For others: only publicKey is set. */
  signingKeyPair?: KeyPair;
  signingPublicKey: Uint8Array;
  skippedKeys = new Map<number, Uint8Array>();

  /** Serializes the group chain state to plain JSON, so a restart doesn't lose
   * the ability to decrypt a sender's group messages until they re-distribute. */
  toJSON(): any {
    return {
      keyID: this.keyID,
      chainKey: base64Encode(this.chainKey),
      chainIndex: this.chainIndex,
      signingKey: this.signingKeyPair ? base64Encode(this.signingKeyPair.privateKey) : undefined,
      signingPublicKey: base64Encode(this.signingPublicKey),
      skippedKeys: [...this.skippedKeys.entries()].map(([index, mk]) => ({ index, mk: base64Encode(mk) })),
    };
  }

  static fromJSON(json: any): SenderKeyState {
    let state = new SenderKeyState();
    state.keyID = json.keyID;
    state.chainKey = base64Decode(json.chainKey);
    state.chainIndex = json.chainIndex;
    state.signingKeyPair = json.signingKey ? KeyPair.fromPrivate(base64Decode(json.signingKey)) : undefined;
    state.signingPublicKey = base64Decode(json.signingPublicKey);
    for (let skipped of json.skippedKeys ?? []) {
      state.skippedKeys.set(skipped.index, base64Decode(skipped.mk));
    }
    return state;
  }
}

function chainStep(chainKey: Uint8Array): { messageKeySeed: Uint8Array, nextChainKey: Uint8Array } {
  return {
    messageKeySeed: hmacSHA256(chainKey, new Uint8Array([1])),
    nextChainKey: hmacSHA256(chainKey, new Uint8Array([2])),
  };
}

function deriveMessageKeys(seed: Uint8Array): { iv: Uint8Array, cipherKey: Uint8Array } {
  let out = hkdfSHA256(seed, kZero32, enc("WhisperGroup"), 48);
  return { iv: out.slice(0, 16), cipherKey: out.slice(16, 48) };
}

/** Creates our own sender key state for a group (random chain + signing key). */
export function createSenderKey(keyID: number): SenderKeyState {
  let state = new SenderKeyState();
  state.keyID = keyID;
  state.chainKey = randomBytes(32);
  state.chainIndex = 0;
  state.signingKeyPair = KeyPair.generate();
  // The signing key travels in the SenderKeyDistributionMessage in 33-byte djb
  // form (0x05 || key), like every Signal public key on the wire; a real peer
  // stores it verbatim and verifies our SenderKeyMessage signatures against it.
  state.signingPublicKey = djbEncode(state.signingKeyPair.publicKey);
  return state;
}

/** The distribution message to send to group members so they can decrypt our messages. */
export function createDistributionMessage(state: SenderKeyState): Uint8Array {
  return serializeSenderKeyDistributionMessage({
    id: state.keyID,
    iteration: state.chainIndex,
    chainKey: state.chainKey,
    signingKey: state.signingPublicKey,
  });
}

/** Processes a peer's distribution message into a receiving sender key state. */
export function processDistributionMessage(data: Uint8Array): SenderKeyState {
  let dist = parseSenderKeyDistributionMessage(data);
  let state = new SenderKeyState();
  state.keyID = dist.id;
  state.chainKey = dist.chainKey;
  state.chainIndex = dist.iteration;
  state.signingPublicKey = dist.signingKey;
  return state;
}

export async function groupEncrypt(state: SenderKeyState, plaintext: Uint8Array): Promise<Uint8Array> {
  if (!state.signingKeyPair) {
    throw new Error("Cannot encrypt without our signing key");
  }
  let { messageKeySeed, nextChainKey } = chainStep(state.chainKey);
  let iteration = state.chainIndex;
  state.chainKey = nextChainKey;
  state.chainIndex++;
  let { iv, cipherKey } = deriveMessageKeys(messageKeySeed);
  let ciphertext = await aesCBCEncrypt(cipherKey, iv, padPlaintext(plaintext));
  return serializeSenderKeyMessage({ keyID: state.keyID, iteration, ciphertext }, state.signingKeyPair.privateKey);
}

export async function groupDecrypt(state: SenderKeyState, data: Uint8Array): Promise<Uint8Array> {
  let message = parseSenderKeyMessage(data, state.signingPublicKey); // verifies the signature
  let seed = senderKeyMessageSeed(state, message.iteration);
  let { iv, cipherKey } = deriveMessageKeys(seed);
  return unpadPlaintext(await aesCBCDecrypt(cipherKey, iv, message.ciphertext));
}

function senderKeyMessageSeed(state: SenderKeyState, iteration: number): Uint8Array {
  if (state.skippedKeys.has(iteration)) {
    let seed = state.skippedKeys.get(iteration)!;
    state.skippedKeys.delete(iteration);
    return seed;
  }
  if (iteration < state.chainIndex) {
    throw new Error("Duplicate or too-old group message");
  }
  if (iteration - state.chainIndex > kMaxSkip) {
    throw new Error("Too many skipped group messages");
  }
  while (state.chainIndex < iteration) {
    let { messageKeySeed, nextChainKey } = chainStep(state.chainKey);
    state.skippedKeys.set(state.chainIndex, messageKeySeed);
    state.chainKey = nextChainKey;
    state.chainIndex++;
  }
  let { messageKeySeed, nextChainKey } = chainStep(state.chainKey);
  state.chainKey = nextChainKey;
  state.chainIndex++;
  return messageKeySeed;
}
