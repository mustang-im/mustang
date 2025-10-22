import { EMail } from "../EMail";
import type { POP3Folder } from "./POP3Folder";

export class POP3EMail extends EMail {
  declare folder: POP3Folder;
}
