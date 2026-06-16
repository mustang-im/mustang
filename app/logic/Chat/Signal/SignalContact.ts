/** A Signal chat contact, identified by their ACI. Mirrors `XMPPPerson` /
 * `WhatsAppContact`: it is the `ChatPersonUID` the rest of the chat code uses, and
 * also carries the Signal-specific identifiers and the profile key needed to fetch
 * the contact's profile and to address group ciphertext to them. */
import { ChatPersonUID } from "../ChatPersonUID";
import { ServiceId } from "./ServiceId";

export class SignalContact extends ChatPersonUID {
  /** The account identifier (stable UUID). The primary key for this contact. */
  serviceId: ServiceId;
  /** The phone-number identity, if known (a separate UUID). */
  pni: ServiceId | null = null;
  /** The E.164 phone number, if known (not always discoverable). */
  e164: string | null = null;
  /** Their 32-byte profile key, once learned (from a message or storage service),
   * used to fetch and decrypt their profile + avatar, and in group credentials. */
  profileKey: Uint8Array | null = null;
  /** Their identity public key (33-byte DJB form), once a session is established. */
  identityKey: Uint8Array | null = null;
  /** Blocked by the user (from the storage-service ContactRecord). */
  blocked = false;

  constructor(serviceId: ServiceId, name?: string) {
    super("signal", serviceId.toString(), name);
    this.serviceId = serviceId;
  }
}
