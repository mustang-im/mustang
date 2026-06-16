/** Signal's hardcoded sealed-sender trust root (Docs/03 §7). The 33-byte DJB
 * public key whose signature anchors the ServerCertificate → SenderCertificate
 * chain. This is the production value baked into Signal-Android / libsignal
 * (`UnidentifiedAccess`/`env.rs` `UNIDENTIFIED_SENDER_TRUST_ROOT`). */
import { base64Decode } from "../Crypto/primitives";
import { djbDecode } from "../Crypto/curve";

/** 33-byte DJB-encoded (0x05 ‖ 32). */
const kTrustRootDjb = base64Decode("BXu6QIKVz5MA8gstzfOgRQGqyLqOwNKHxXBZ7kB54FCM");

/** The raw 32-byte trust-root public key (the form `validateSenderCertificate`
 * verifies XEdDSA signatures against). */
export const kSignalTrustRoot = djbDecode(kTrustRootDjb);
