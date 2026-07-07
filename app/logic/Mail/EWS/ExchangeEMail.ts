import { EMail } from "../EMail";
import type { Tag } from "../../Abstract/Tag";

export abstract class ExchangeEMail extends EMail {
  async addTagOnServer(tag: Tag) {
    await this.updateTags();
  }

  async removeTagOnServer(tag: Tag) {
    await this.updateTags();
  }

  abstract updateTags(): Promise<void>;
}
