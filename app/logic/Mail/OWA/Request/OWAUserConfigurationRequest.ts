import { OWARequest } from "./OWARequest";

export class OWAGetUserConfigurationRequest extends OWARequest {
  constructor(name: string, distinguishedFolderID: string) {
    super("GetUserConfiguration", {
      __type: "GetUserConfigurationRequest:#Exchange",
      UserConfigurationName: OWAGetUserConfigurationRequest.configurationName(name, distinguishedFolderID),
      UserConfigurationProperties: "XmlData",
    });
  }

  static configurationName(name: string, distinguishedFolderID: string): any {
    return {
      __type: "UserConfigurationNameType:#Exchange",
      Name: name,
      BaseFolderId: {
        __type: "DistinguishedFolderId:#Exchange",
        Id: distinguishedFolderID,
      },
    };
  }
}

export class OWASaveUserConfigurationRequest extends OWARequest {
  /**
   * @param xmlData base64
   * @param isNew The user configuration does not exist yet
   */
  constructor(name: string, distinguishedFolderID: string, xmlData: string, isNew: boolean) {
    let action = isNew ? "CreateUserConfiguration" : "UpdateUserConfiguration";
    super(action, {
      __type: action + "Request:#Exchange",
      UserConfiguration: {
        __type: "ServiceUserConfiguration:#Exchange",
        UserConfigurationName: OWAGetUserConfigurationRequest.configurationName(name, distinguishedFolderID),
        XmlData: xmlData,
      },
    });
  }
}
