/** One OMEMO device of a user — their phone, laptop, etc. A user has several,
 * and an OMEMO message is encrypted separately for each of them.
 * Identified by the owner's bare JID plus the device's OMEMO device ID. */
export class OMEMODevice {
  /** Bare JID of the device's owner */
  readonly jid: string;
  /** OMEMO device ID: a random positive 31-bit integer the owner chose */
  readonly id: number;
  /** We could not build a session with it (e.g. no/broken bundle); skip it
   * when encrypting, rather than failing the whole message. */
  broken = false;

  constructor(jid: string, id: number) {
    this.jid = jid;
    this.id = id;
  }

  /** Key into the Signal session store */
  get address(): string {
    return `${this.jid}.${this.id}`;
  }
}
