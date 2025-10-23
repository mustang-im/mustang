/** <https://www.rfc-editor.org/rfc/rfc9610.html#name-addressbooks> */
export interface TJMAPAddressbook {
  readonly id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  readonly isDefault: boolean;
  isSubscribed: boolean;
  shareWith: Record<string, TJMAPAddressbookRights> | null;
  readonly myRights: TJMAPAddressbookRights;
  onDestroyRemoveContents: boolean;
  onSuccessSetIsDefault: string | null;
}

/** <https://www.rfc-editor.org/rfc/rfc9610.html#name-addressbooks> */
export interface TJMAPAddressbookRights {
  mayRead: boolean;
  mayWrite: boolean;
  mayShare: boolean;
  mayDelete: boolean;
}
