import type { Calendar } from "../../Calendar/Calendar";
import type { Addressbook } from "../../Contacts/Addressbook";
import type { FileSharingAccount } from "../../Files/FileSharingAccount";
import type { ChatAccount } from "../../Chat/ChatAccount";
import type { MeetAccount } from "../../Meet/MeetAccount";
import type { URLString } from "../../util/util";

/** Only for setup. Additional info about an account or related accounts. */
export class SetupInfo {
  calendar: Calendar;
  addressbook: Addressbook;
  fileShare: FileSharingAccount;
  chat: ChatAccount;
  meet: MeetAccount;
  /** We know a config, but the user needs to do some manual steps for this ISP */
  instructions: SetupInstruction[] | null = null;
}

export class SetupInstruction {
  instruction: string | null;
  url: URLString | null;
  enterPassword: boolean = false;
  enterUsername: boolean = false;
}
