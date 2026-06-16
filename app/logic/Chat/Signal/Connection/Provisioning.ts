/** Linking this app as a secondary (companion) Signal device — the default setup
 * path (Docs/02). Flow:
 *   1. open the provisioning WebSocket, receive our ProvisioningAddress (uuid);
 *   2. show a QR `sgnl://linkdevice?uuid=<uuid>&pub_key=<our ephemeral pubkey>`;
 *   3. the user scans it on their phone; the phone encrypts a ProvisionMessage to
 *      our public key and sends it as a ProvisionEnvelope over the socket;
 *   4. decrypt it (verified ProvisioningCipher) → the account's ACI/PNI identity
 *      keys, profileKey, provisioningCode;
 *   5. PUT /v1/devices/link with our account attributes + freshly generated prekeys
 *      → the server assigns our deviceId.
 *
 * The provisioning socket framing + the device-link request are spec-faithful per
 * Docs/02; the ProvisioningCipher and key generation are the verified crypto. */
import { KeyPair } from "../Crypto/KeyPair";
import { djbEncode } from "../Crypto/curve";
import { decryptProvisionEnvelope } from "../Encryption/ProvisioningCipher";
import { decode } from "../Proto/codec";
import { ProvisionEnvelope, ProvisionMessage, ProvisioningAddress } from "../Proto/provisioning";
import { SignalWebSocket } from "./SignalWebSocket";
import { base64Encode } from "../Crypto/primitives";

export interface ProvisionResult {
  message: ProvisionMessage;
  /** Our ephemeral keypair the phone encrypted to (kept only during linking). */
  ephemeralKeyPair: KeyPair;
}

export class Provisioning {
  protected socket: SignalWebSocket | null = null;
  /** Our ephemeral identity for this linking handshake (its public key is in the QR). */
  readonly ephemeralKeyPair = KeyPair.generate();
  /** Called with the QR string to render once we have our provisioning address. */
  onQR: (qr: string) => void = () => undefined;

  /** Run the link flow; resolves with the decrypted ProvisionMessage from the phone. */
  async run(): Promise<ProvisionResult> {
    let socket = new SignalWebSocket("/v1/websocket/provisioning/");
    this.socket = socket;
    let envelopeBytes = await new Promise<Uint8Array>((resolve, reject) => {
      socket.onRequest = async req => {
        if (req.path == "/v1/address" && req.body) {
          // The server assigned our provisioning address; show the QR.
          let address = decode(ProvisioningAddress, req.body).address ?? "";
          this.onQR(this.qrCode(address));
        } else if (req.path == "/v1/message" && req.body) {
          resolve(req.body);
        }
        return 200;
      };
      socket.onClose = () => reject(new Error("Provisioning socket closed before linking completed"));
      socket.connectUnauthenticated().catch(reject);
    });

    let envelope = decode(ProvisionEnvelope, envelopeBytes);
    let plaintext = await decryptProvisionEnvelope(this.ephemeralKeyPair, envelope.publicKey!, envelope.body!);
    let message = decode(ProvisionMessage, plaintext);
    socket.disconnect();
    this.socket = null;
    return { message, ephemeralKeyPair: this.ephemeralKeyPair };
  }

  /** The `sgnl://linkdevice` URI shown as a QR code (Docs/02; pub_key is base64,
   * no padding). */
  protected qrCode(provisioningUuid: string): string {
    let pubKey = base64Encode(djbEncode(this.ephemeralKeyPair.publicKey)).replace(/=+$/, "");
    return `sgnl://linkdevice?uuid=${encodeURIComponent(provisioningUuid)}&pub_key=${encodeURIComponent(pubKey)}`;
  }

  cancel(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
