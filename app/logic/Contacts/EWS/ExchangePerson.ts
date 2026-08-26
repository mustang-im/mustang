import { Person } from '../../Abstract/Person';
import { dataURLToBlob, type URLString } from '../../util/util';
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class ExchangePerson extends Person {
  /** The picture that the server has.
   * Exchange saves the picture separately from the rest of the contact,
   * so upload it only when the user changed it.
   * Not saved in the database, so the first save after a restart uploads it again. */
  protected pictureOnServer: URLString | null | undefined;

  /** Whether the user changed the picture since we last got it from the server */
  protected get pictureChanged(): boolean {
    return this.picture != this.pictureOnServer;
  }

  /**
   * @param base64 The picture, as the server sent it
   * @param mimeType As the server declared it
   */
  protected pictureFromBase64(base64: string, mimeType: string = kPictureMIMEType) {
    if (!mimeType.startsWith("image/")) {
      mimeType = kPictureMIMEType;
    }
    this.picture = sanitize.url(`data:${mimeType};base64,${base64}`, null, ["data"]);
  }

  /** The picture as image file, which is how Exchange stores it */
  protected async pictureAsBlob(): Promise<Blob> {
    return await dataURLToBlob(this.picture);
  }
}

/** Exchange saves the contact picture as a JPEG file attached to the contact */
export const kPictureFilename = "ContactPicture.jpg";
const kPictureMIMEType = "image/jpeg";
