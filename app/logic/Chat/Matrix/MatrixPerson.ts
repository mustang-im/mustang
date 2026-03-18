import { ChatPerson } from "../ChatPerson";
import type { MatrixAccount } from "./MatrixAccount";
import type { RoomMember } from "matrix-js-sdk";

export class MatrixPerson extends ChatPerson {
  constructor(matrixID: string, name: string) {
    super("matrix", matrixID, name);
  }
  setAvatar(member: RoomMember, account: MatrixAccount) {
    let picURL = member.getAvatarUrl(account.baseURL, 64, 64, "scale", true, false);
    // let picMXC = member.getMxcAvatarUrl();
    // let picURL = getHttpUriForMxc(this.baseURL, picMXC, 64, 64, "scale", true);
    this.picture = picURL;
  }
}
