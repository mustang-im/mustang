import { OWARequest } from "./OWARequest";

export class OWAGetFolderRequest extends OWARequest {
  constructor(folderID: string) {
    super("GetFolder", {
      __type: "GetFolderRequest:#Exchange",
      FolderShape: {
        __type: "FolderResponseShape:#Exchange",
        BaseShape: "Default",
        AdditionalProperties: [{
          __type: "PropertyUri:#Exchange",
          FieldURI: "folder:FolderClass",
        }],
      },
      FolderIds: [{
        __type: "FolderId:#Exchange",
        Id: folderID,
      }],
    });
  }
}
