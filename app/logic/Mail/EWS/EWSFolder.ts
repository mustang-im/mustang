import { Folder } from "../Folder";
import { EWSEMail } from "./EWSEMail";

export class EWSFolder extends Folder {

  newEMail(): EWSEMail {
    return new EWSEMail(this);
  }
}
