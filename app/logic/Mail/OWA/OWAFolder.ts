import { Folder } from "../Folder";
import { OWAEMail } from "./OWAEMail";

export class OWAFolder extends Folder {

  newEMail(): OWAEMail {
    return new OWAEMail(this);
  }
}
