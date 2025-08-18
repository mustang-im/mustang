import { selectedApp } from "../AppsBar/selectedApp";
import { contactsMustangApp } from "../Contacts/ContactsMustangApp";
import type { Observable } from "../../logic/util/Observable";
import { Person } from "../../logic/Abstract/Person";
import { selectedPerson } from "../Contacts/Person/Selected";
import { NotImplemented } from "../../logic/util/util";

// TODO compare openApp(), openEventFromOtherApp(), mailto: etc.
export function openUIFor(obj: Observable) {
  if (obj instanceof Person) {
    selectedPerson.set(obj);
    selectedApp.set(contactsMustangApp);
    return;
  }
  throw new NotImplemented("Don't know how to open this kind of object");
}
