import type { URLString } from "../util/util";

/**
 * A webapp installed on a given cloud storage account that allows to edit the
 * files of a given type on that cloud storage.
 *
 * E.g. one entry from Nextcloud's OCS Direct Editing API:
 *   GET /ocs/v2.php/apps/files/api/v1/directEditing
 * @see https://docs.nextcloud.com/server/latest/developer_manual/client_apis/OCS/ocs-direct-editing-api.html
 *
 * or one entry from openCloud / ownCloud Infinite Scale's WOPI app-provider service:
 *   GET /app/list
 * @see https://owncloud.dev/services/app-provider/
 */
export interface EditorWebApp {
  /** App ID, e.g. "richdocuments" for Nextcloud Office, "onlyoffice" for ONLYOFFICE. */
  id: string;
  /** Human-readable name, e.g. "Nextcloud Office". */
  name: string;
  /** MIME types for which this editor is the default. Matches `File.mimetype`. */
  mimetypes: string[];
  /** MIME types the editor can also open if the user explicitly selects this editor. */
  optionalMimetypes: string[];
  /** App icon. URL of SVG */
  icon: URLString;
  homepage: URLString;
}
