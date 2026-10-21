import { OWARequest } from "./OWARequest";

export class OWAGetFolderRequest extends OWARequest {
  constructor(folderID: object) {
    super("GetFolder", {
      __type: "GetFolderRequest:#Exchange",
      FolderShape: {
        __type: "FolderResponseShape:#Exchange",
        BaseShape: "Default",
        AdditionalProperties: [{
          __type: "PropertyUri:#Exchange",
          FieldURI: "folder:FolderClass",
        }, {
          __type: "PropertyUri:#Exchange",
          FieldURI: "folder:DistinguishedFolderId",
        }],
      },
      FolderIds: [folderID],
    });
  }
}
