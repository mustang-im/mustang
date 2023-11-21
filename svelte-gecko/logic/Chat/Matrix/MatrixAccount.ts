import * as matrix from 'matrix-js-sdk';
import olm from 'olm';

export class MatrixAccount {
  client: matrix.MatrixClient;
  baseURL: "https://matrix.org";
  /** Login to this account on the server. Opens network connection.
   * You must call this after creating the object and having set its properties.
   * This will populate `persons` and `chats`. */
  async login() {
    this.client = matrix.createClient({ baseUrl: this.baseURL });
    global.Olm = olm;
    await this.client.initCrypto();
    let rooms = await this.client.publicRooms();
    console.log("Public Rooms: %s", JSON.stringify(rooms));
  };
}
