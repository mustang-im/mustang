import type { Builder } from "./base/node";
import type { Reporter } from "./base/reporter";
import type { DecoderBuffer } from "./base/buffer";
import { PEMDecoder } from "./decoders/pem";
import { PEMEncoder } from "./encoders/pem";

export function define<T = any>(name: string, body: (this: Builder) => void): Entity<T> {
  return new Entity<T>(name, body);
};

export class Entity<T = any> {
  name: string;
  body: (this: Builder) => void;
  decoder?: PEMDecoder;
  encoder?: PEMEncoder;
  constructor(name: string, body: (this: Builder) => void) {
    this.name = name;
    this.body = body;
  }

  _getDecoder(): PEMDecoder {
    return this.decoder ??= new PEMDecoder(this);
  }

  decode(data: Uint8Array | DecoderBuffer, options?: object): T {
    return this._getDecoder().decode(data, options);
  }

  decodeBase64(data: string, options?: object): T {
    return this._getDecoder().decodeBase64(data, options);
  }

  decodePEM(data: string, options: object & { label: string }): T {
    return this._getDecoder().decodePEM(data, options);
  }

  _getEncoder(): PEMEncoder {
    return this.encoder ??= new PEMEncoder(this);
  }

  encode(...rest: T extends void ? [] : [T] | [T, Reporter]): Uint8Array;
  encode(data?: T, reporter?: Reporter): Uint8Array {
    return this._getEncoder().encode(data, reporter);
  }

  encodeBase64(data: T): string {
    return this._getEncoder().encodeBase64(data);
  }

  encodePEM(data: T, options: { label: string }): string {
    return this._getEncoder().encodePEM(data, options);
  }
}
