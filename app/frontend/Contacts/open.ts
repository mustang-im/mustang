import type { Person } from "../../logic/Abstract/Person";
import { getContactsSelection } from "./Person/Selected";
import { contactsMustangApp } from "./ContactsMustangApp";
import { getNavigation } from "../AppsBar/selectedApp";
import type { AppWindow } from "../MainWindow/AppWindow";
import { appGlobal } from "../../logic/app";

export function openPersonFromOtherApp(person: Person, appWindow: AppWindow) {
  let { goTo, openApp, bringAppToFront } = getNavigation(appWindow);
  getContactsSelection(appWindow.mainWindow).selectedPerson.set(person);
  if (appGlobal.isMobile) {
    goTo(`/contacts/person/${person.id}/edit`, { person });
  } else {
    openApp(contactsMustangApp, {});
  }
  if (appWindow.mainWindow != appWindow) {
    bringAppToFront();
  }
}
