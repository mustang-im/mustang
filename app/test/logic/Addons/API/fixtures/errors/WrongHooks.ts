import { addon, addonHook } from "../../../../../../logic/Addons/API/addon";

@addon("mail")
export class Mail {
}

export class Hooks {
  @addonHook("test.sync", "mail")
  sync(mail: Mail): void {
  }
  @addonHook("test.callback", "mail")
  async callback(mail: Mail, done: () => void): Promise<void> {
  }
  @addonHook("test.twice", "mail")
  async first(mail: Mail): Promise<void> {
  }
  @addonHook("test.twice", "mail")
  async second(mail: Mail): Promise<void> {
  }
  @addonHook("test.group", "everything")
  async group(mail: Mail): Promise<void> {
  }
}
