/** Added to `PublicKey` */
export interface PrivateKey {
  /** User wishes to sign all outgoing emails */
  useToSign: boolean;
  didBackup: boolean;
  /** Set when the key is created.
   * Do not save this property. It should be false on load. */
  justCreated: boolean;

  /** User wishes to send encrypted emails whenever possible */
  encryptByDefault: boolean;

  privateKeyAsFile(): File;
}
