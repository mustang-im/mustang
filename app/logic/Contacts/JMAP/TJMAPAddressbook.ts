/** <https://www.rfc-editor.org/rfc/rfc9610.html#name-addressbooks> */
export interface TJMAPAddressbook {
  readonly id: string;
  name: string;
  description?: string;
  sortOrder: number;
  readonly isDefault: boolean;
  isSubscribed: boolean;
  shareWith?: Record<string, TJMAPAddressbookRights>;
  readonly myRights: TJMAPAddressbookRights;
  onDestroyRemoveContents: boolean;
  onSuccessSetIsDefault?: string;
}

/** <https://www.rfc-editor.org/rfc/rfc9610.html#name-addressbooks> */
export interface TJMAPAddressbookRights {
  mayRead: boolean;
  mayWrite: boolean;
  mayShare: boolean;
  mayDelete: boolean;
}
