/** A Signal account identity. Every account has an **ACI** (account identifier, a
 * UUID that is stable across phone-number changes) and a **PNI** (phone-number
 * identity, a separate UUID tied to the current number). Both are 16-byte UUIDs;
 * the E.164 phone number is separate again and not always known.
 *
 * On the wire a ServiceId is a UUID string (ACI) or `"PNI:"+uuid` (PNI), and in
 * binary either the bare 16-byte UUID (ACI) or `0x01 ‖ uuid` (PNI). */
import { bytesToHex, hexToBytes } from "@noble/curves/utils.js";

export type ServiceIdKind = "aci" | "pni";

export class ServiceId {
  readonly kind: ServiceIdKind;
  /** 16-byte UUID. */
  readonly uuid: Uint8Array;

  constructor(kind: ServiceIdKind, uuid: Uint8Array) {
    if (uuid.length != 16) {
      throw new Error("ServiceId UUID must be 16 bytes");
    }
    this.kind = kind;
    this.uuid = uuid;
  }

  static aci(uuid: Uint8Array): ServiceId {
    return new ServiceId("aci", uuid);
  }
  static pni(uuid: Uint8Array): ServiceId {
    return new ServiceId("pni", uuid);
  }

  /** Parse a service-id string: `"PNI:<uuid>"` for a PNI, otherwise an ACI UUID. */
  static parse(s: string): ServiceId {
    return s.startsWith("PNI:")
      ? ServiceId.pni(uuidToBytes(s.slice(4)))
      : ServiceId.aci(uuidToBytes(s));
  }

  /** The string the chat service uses: ACI = the UUID; PNI = `"PNI:"+uuid`. */
  toString(): string {
    return this.kind == "pni" ? "PNI:" + this.uuidString() : this.uuidString();
  }

  /** The canonical 8-4-4-4-12 UUID string. */
  uuidString(): string {
    let h = bytesToHex(this.uuid);
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }

  /** Variable-width binary: ACI = 16-byte UUID; PNI = `0x01 ‖ uuid` (17 bytes). */
  serviceIdBinary(): Uint8Array {
    return this.kind == "aci" ? this.uuid : Uint8Array.from([0x01, ...this.uuid]);
  }

  /** Fixed-width 17-byte binary: `kindByte ‖ uuid` (ACI=0x00, PNI=0x01). */
  serviceIdFixedWidthBinary(): Uint8Array {
    return Uint8Array.from([this.kind == "aci" ? 0x00 : 0x01, ...this.uuid]);
  }

  equals(other: ServiceId | null | undefined): boolean {
    return !!other && this.kind == other.kind && bytesToHex(this.uuid) == bytesToHex(other.uuid);
  }
}

export function uuidToBytes(s: string): Uint8Array {
  return hexToBytes(s.replace(/-/g, "").toLowerCase());
}

export function bytesToUuid(b: Uint8Array): string {
  let h = bytesToHex(b);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
