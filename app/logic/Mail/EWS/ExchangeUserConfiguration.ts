import { PersonUID } from "../../Abstract/PersonUID";
import { base64ToUint8Array } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export const kOtherMailboxConfig = "OWA.OtherMailbox";

export function decodeXMLData(xmlData: string | null | undefined): string | null {
  if (!xmlData) {
    return null;
  }
  return new TextDecoder().decode(base64ToUint8Array(xmlData));
}

export function parseOtherMailboxes(xml: string | null): PersonUID[] {
  if (!xml) {
    return [];
  }
  let document = new DOMParser().parseFromString(xml, "text/xml");
  if (document.documentElement?.localName != "OtherMailbox") {
    return [];
  }
  let persons: PersonUID[] = [];
  for (let entry of document.documentElement.children) {
    if (entry.localName != "entry") {
      continue;
    }
    let emailAddress = sanitize.emailAddress(entry.getAttribute("principalSMTPAddress"), null);
    if (!emailAddress || persons.some(person => person.emailAddress == emailAddress)) {
      continue;
    }
    let name = sanitize.nonemptylabel(entry.getAttribute("displayName"), null) ?? undefined;
    persons.push(new PersonUID(emailAddress, name));
  }
  return persons;
}
