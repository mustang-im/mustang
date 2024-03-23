import { Folder } from "../Folder";
import { ActiveSyncEMail } from "./ActiveSyncEMail";

export class ActiveSyncFolder extends Folder {

  newEMail(): ActiveSyncEMail {
    return new ActiveSyncEMail(this);
  }
}
