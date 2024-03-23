import { Folder } from "../Folder";
import { POP3EMail } from "./POP3EMail";

export class POP3Folder extends Folder {

  newEMail(): POP3EMail {
    return new POP3EMail(this);
  }
}
