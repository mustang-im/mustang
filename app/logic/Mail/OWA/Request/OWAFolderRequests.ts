import { OWARequest } from "./OWARequest";
import type { OWAEMail } from "../OWAEMail";

export function owaFindMsgsInFolderRequest(folderID: string, maxFetchCount: number): OWARequest {
  return new OWARequest("FindItem", {
    __type: "FindItemRequest:#Exchange",
    ItemShape: {
      __type: "ItemResponseShape:#Exchange",
      BaseShape: "IdOnly",
      AdditionalProperties: [{
        __type: "PropertyUri:#Exchange",
        FieldURI: "message:IsRead",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:IsDraft",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:Categories",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:Flag",
        /*}, {
          __type: "PropertyUri:#Exchange",
          ExtendedFieldURI: {
            PropertyTag: "0x1080",
            PropertyType: "Integer",
          },*/
      }],
    },
    ParentFolderIds: [{
      __type: "FolderId:#Exchange",
      Id: folderID,
    }],
    Traversal: "Shallow",
    Paging: {
      __type: "IndexedPageView:#Exchange",
      BasePoint: "Beginning",
      Offset: 0,
      MaxEntriesReturned: maxFetchCount,
    },
  });
}

export function owaGetNewMsgHeadersRequest(newMessageIDs: string[]): OWARequest {
  return new OWARequest("GetItem", {
    __type: "GetItemRequest:#Exchange",
    ItemShape: {
      __type: "ItemResponseShape:#Exchange",
      BaseShape: "IdOnly",
      AdditionalProperties: [{
        __type: "PropertyUri:#Exchange",
        FieldURI: "message:InternetMessageId",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "message:IsRead",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "message:References",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "message:ReplyTo",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "message:From",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "message:Sender",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "message:ToRecipients",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "message:CcRecipients",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "message:BccRecipients",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:ItemClass",
        /* Non-MIME @see OWAEMail.bodyAndAttachmentsFromJson()
        }, {
          __type: "PropertyUri:#Exchange",
          FieldURI: "item:Attachments",
        */
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:Subject",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:DateTimeReceived",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:InReplyTo",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:IsDraft",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:DateTimeSent",
        /* Non-MIME
        }, {
          __type: "PropertyUri:#Exchange",
          FieldURI: "item:Body",
        */
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:Categories",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:Flag",
        /* Non-MIME
        }, {
          __type: "PropertyUri:#Exchange",
          FieldURI: "item:TextBody",
        */
        /*}, {
          __type: "PropertyUri:#Exchange",
          ExtendedFieldURI: {
            PropertyTag: "0x1080",
            PropertyType: "Integer",
          },*/
      }],
    },
    ItemIds: newMessageIDs.map(id => ({
      __type: "ItemId:#Exchange",
      Id: id,
    })),
  });
}

export function owaDownloadMsgsRequest(messages: OWAEMail[]): OWARequest {
  return new OWARequest("GetItem", {
    __type: "GetItemRequest:#Exchange",
    ItemShape: {
      __type: "ItemResponseShape:#Exchange",
      BaseShape: "IdOnly",
      AdditionalProperties: [{ // Work around Office365 bug
        __type: "PropertyUri:#Exchange",
        FieldURI: "item:Size"
      }],
      IncludeMimeContent: true,
    },
    ItemIds: messages.map(message => ({
      __type: "ItemId:#Exchange",
      Id: message.itemID,
    })),
  });
}

export function owaMoveOrCopyMsgsIntoFolderRequest(action: "Move" | "Copy", folderID: string, messages: OWAEMail[]): OWARequest {
  return new OWARequest(action + "Item", {
    __type: action + "ItemRequest:#Exchange",
    ItemIds: messages.map(message => ({
      __type: "ItemId:#Exchange",
      Id: message.itemID,
    })),
    ToFolderId: {
      __type: "TargetFolderId:#Exchange",
      BaseFolderId: {
        __type: "FolderId:#Exchange",
        Id: folderID,
      },
    },
    // ReturnNewItemIds: false,
  });
}

export function owaFindFoldersRequest(deep: boolean, sharedFolderRoot?: string | null, username?: string): OWARequest {
  return new OWARequest("FindFolder", {
    __type: "FindFolderRequest:#Exchange",
    FolderShape: {
      BaseShape: "Default",
      AdditionalProperties: [{
        __type: "PropertyUri:#Exchange",
          FieldURI: "folder:FolderClass",
      }, {
        __type: "PropertyUri:#Exchange",
          FieldURI: "folder:ParentFolderId",
      }, {
        __type: "PropertyUri:#Exchange",
          FieldURI: "folder:DistinguishedFolderId",
      }],
    },
    Paging: null,
    ParentFolderIds: [sharedFolderRoot
    ? {
      __type: "DistinguishedFolderId:#Exchange",
      Id: sharedFolderRoot,
      Mailbox: {
        EmailAddress: username,
      },
    }
    : {
      __type: "DistinguishedFolderId:#Exchange",
      Id: "msgfolderroot",
    }],
    ReturnParentFolder: true,
    Traversal: deep ? "Deep" : "Shallow",
  });
}

export function owaMoveEntireFolderRequest(sourceFolderID: string, newParentFolderId: string): OWARequest {
  return new OWARequest("MoveFolder", {
    __type: "MoveFolderRequest:#Exchange",
    FolderIds: [{
      FolderId: {
        __type: "FolderId:#Exchange",
        Id: sourceFolderID,
      },
    }],
    ToFolderId: {
      __type: "TargetFolderId:#Exchange",
      FolderId: {
        __type: "FolderId:#Exchange",
        Id: newParentFolderId,
      },
    },
  });
}

export function owaCreateNewSubFolderRequest(name: string, parentFolderID: string): OWARequest {
  return new OWARequest("CreateFolder", {
    __type: "CreateFolderRequest:#Exchange",
    ParentFolderId: {
      __type: "TargetFolderId:#Exchange",
      BaseFolderId: {
        __type: "FolderId:#Exchange",
        Id: parentFolderID,
      },
    },
    Folders: [{
      __type: "Folder:#Exchange",
      FolderClass: "IPF.Note",
      DisplayName: name,
    }],
  });
}

export function owaCreateNewTopLevelFolderRequest(name: string, username: string | null): OWARequest {
  return new OWARequest("CreateFolder", {
    __type: "CreateFolderRequest:#Exchange",
    ParentFolderId: {
      __type: "TargetFolderId:#Exchange",
      BaseFolderId: username
      ? {
        __type: "DistinguishedFolderId:#Exchange",
        Id: "msgfolderroot",
        Mailbox: {
          EmailAddress: username,
        },
      }
      : {
        __type: "DistinguishedFolderId:#Exchange",
        Id: "msgfolderroot",
      },
    },
    Folders: [{
      __type: "Folder:#Exchange",
      FolderClass: "IPF.Note",
      DisplayName: name,
    }],
  });
}

export function owaRenameFolderRequest(name: string, folderID: string): OWARequest {
  return new OWARequest("UpdateFolder", {
    __type: "UpdateFolderRequest:#Exchange",
    FolderChanges: [{
      __type: "FolderChange:#Exchange",
      FolderId: {
        __type: "FolderId:#Exchange",
        Id: folderID,
      },
      Updates: [{
        __type: "SetFolderField:#Exchange",
        Folder: {
          __type: "Folder:#Exchange",
          DisplayName: name,
        },
        Path: {
          __type: "PropertyUri:#Exchange",
          FieldURI: "FolderDisplayName",
        },
      }],
    }],
  });
}

export function owaSharedFolderRequest(distinguishedIDs: string[], emailAddress: string): OWARequest {
  return new OWARequest("GetFolder", {
    __type: "GetFolderRequest:#Exchange",
    FolderShape: {
      __type: "FolderResponseShape:#Exchange",
      BaseShape: "Default",
      AdditionalProperties: [{
        __type: "PropertyUri:#Exchange",
        FieldURI: "folder:FolderClass",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "folder:ParentFolderId",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "folder:DistinguishedFolderId",
      }],
    },
    FolderIds: distinguishedIDs.map(distinguishedID => ({
      __type: "DistinguishedFolderId:#Exchange",
      Id: distinguishedID,
      Mailbox: {
        EmailAddress: emailAddress,
      },
    })),
  });
}

export function owaFolderCountsRequest(folderID: string): OWARequest {
  return new OWARequest("GetFolder", {
    __type: "GetFolderRequest:#Exchange",
    FolderShape: {
      __type: "FolderResponseShape:#Exchange",
      BaseShape: "IdOnly",
      AdditionalProperties: [{
        __type: "PropertyUri:#Exchange",
        FieldURI: "folder:UnreadCount",
      }, {
        __type: "PropertyUri:#Exchange",
        FieldURI: "folder:TotalCount",
      }],
    },
    FolderIds: [{
      __type: "FolderId:#Exchange",
      Id: folderID,
    }],
  });
}

export function owaDeleteFolderRequest(folderID: string): OWARequest {
  return new OWARequest("DeleteFolder", {
    __type: "DeleteFolderRequest:#Exchange",
    FolderIds: [{
      __type: "FolderId:#Exchange",
      Id: folderID,
    }],
    DeleteType: "SoftDelete",
  });
}

export function owaFolderMarkAllMsgsReadRequest(folderID: string): OWARequest {
  return new OWARequest("MarkAllItemsAsRead", {
    __type: "MarkAllItemsAsReadRequest:#Exchange",
    ReadFlag: true,
    SuppressReadReceipts: true,
    FolderIds: [{
      __type: "FolderId:#Exchange",
      Id: folderID,
    }],
    ItemIdsToExclude: [],
  });
}
