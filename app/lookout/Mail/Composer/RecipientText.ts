import { PersonUID } from "../../../logic/Abstract/PersonUID";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class RecipientText {
  static parse(text: string): PersonUID | null {
    let match = text.trim().match(/^(.*?)\s*<([^<>]*)>$/);
    let name = match ? match[1].replace(/^"(.*)"$/, "$1").trim() : "";
    let emailAddress = (match ? match[2] : text).trim();
    if (!sanitize.emailAddress(emailAddress, null)) {
      return null;
    }
    return new PersonUID(emailAddress, name);
  }

  static split(text: string): string[] {
    return RecipientText.splitOutside(text, [";", "\n"])
      .flatMap(part => RecipientText.joinNameParts(RecipientText.splitOutside(part, [","])))
      .map(part => part.trim())
      .filter(part => !!part);
  }

  protected static splitOutside(text: string, separators: string[]): string[] {
    let parts: string[] = [];
    let current = "";
    let inQuotes = false;
    let inBrackets = false;
    for (let char of text) {
      if (char == '"') {
        inQuotes = !inQuotes;
      } else if (char == "<") {
        inBrackets = true;
      } else if (char == ">") {
        inBrackets = false;
      } else if (!inQuotes && !inBrackets && separators.includes(char)) {
        parts.push(current);
        current = "";
        continue;
      }
      current += char;
    }
    parts.push(current);
    return parts;
  }

  protected static joinNameParts(parts: string[]): string[] {
    let joined: string[] = [];
    let pending: string[] = [];
    for (let part of parts) {
      pending.push(part);
      if (part.includes("@")) {
        joined.push(pending.join(","));
        pending = [];
      }
    }
    if (pending.length) {
      joined.push(pending.join(","));
    }
    return joined;
  }

  static parseList(text: string): { recipients: PersonUID[], unresolved: string[] } {
    let recipients: PersonUID[] = [];
    let unresolved: string[] = [];
    for (let part of RecipientText.split(text)) {
      let recipient = RecipientText.parse(part);
      if (recipient) {
        recipients.push(recipient);
      } else {
        unresolved.push(part);
      }
    }
    return { recipients, unresolved };
  }
}
