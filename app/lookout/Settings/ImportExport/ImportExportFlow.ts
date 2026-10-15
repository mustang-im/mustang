import { Addressbook } from "../../../logic/Contacts/Addressbook";
import { Calendar } from "../../../logic/Calendar/Calendar";
import { convertVCardsToPersons, personsToVCardFile } from "../../../logic/Contacts/VCard/VCard";
import { convertICalToEvents } from "../../../logic/Calendar/ICal/ICalToEvent";
import { eventsToICalFile } from "../../../logic/Calendar/ICal/ICalGenerator";
import { saveBlobAsFile } from "../../../frontend/Util/util";
import { assert } from "../../../logic/util/util";
import { gt } from "../../../l10n/l10n";

export type ImportExportAction = "export" | "import-vcard" | "import-ical";
export type ExportFileType = "ical" | "vcard";
export type ImportExportStep = "action" | "file-type" | "file" | "folder";

export class ImportExportFlow {
  action: ImportExportAction = "export";
  fileType: ExportFileType = "ical";
  step: ImportExportStep = "action";
  file: File | null = null;
  folder: Calendar | Addressbook | null = null;

  constructor(preselected: Calendar | Addressbook | null = null) {
    if (preselected instanceof Calendar) {
      this.fileType = "ical";
    } else if (preselected instanceof Addressbook) {
      this.fileType = "vcard";
    }
    this.folder = preselected;
  }

  get steps(): ImportExportStep[] {
    return this.action == "export"
      ? ["action", "file-type", "folder"]
      : ["action", "file", "folder"];
  }

  get isFirstStep(): boolean {
    return this.step == this.steps[0];
  }

  get isLastStep(): boolean {
    return this.step == this.steps[this.steps.length - 1];
  }

  get worksOnCalendars(): boolean {
    return this.action == "import-ical" || this.action == "export" && this.fileType == "ical";
  }

  get canGoNext(): boolean {
    if (this.step == "file") {
      return !!this.file;
    }
    if (this.step == "folder") {
      return !!this.folder && this.folderFitsAction(this.folder);
    }
    return true;
  }

  folderFitsAction(folder: Calendar | Addressbook): boolean {
    return this.worksOnCalendars ? folder instanceof Calendar : folder instanceof Addressbook;
  }

  next() {
    assert(this.canGoNext && !this.isLastStep, "Cannot go to the next step");
    this.step = this.steps[this.steps.indexOf(this.step) + 1];
    if (this.step == "folder" && this.folder && !this.folderFitsAction(this.folder)) {
      this.folder = null;
    }
  }

  back() {
    assert(!this.isFirstStep, "Already at the first step");
    this.step = this.steps[this.steps.indexOf(this.step) - 1];
  }

  async finish() {
    assert(this.isLastStep && this.canGoNext, gt`Please choose a folder first`);
    if (this.action == "export") {
      await this.exportFolder();
    } else if (this.action == "import-vcard") {
      await this.importVCard(this.folder as Addressbook, this.file);
    } else {
      await this.importICal(this.folder as Calendar, this.file);
    }
  }

  protected async exportFolder() {
    if (this.folder instanceof Calendar) {
      // <copied from="../../../frontend/Settings/Calendar/ImportExport.svelte">
      let file = await eventsToICalFile(this.folder.events, this.folder.name);
      await saveBlobAsFile(file);
      // </copied>
    } else if (this.folder instanceof Addressbook) {
      // <copied from="../../../frontend/Settings/Contacts/ImportExport.svelte">
      let file = personsToVCardFile(this.folder.persons, this.folder.name);
      await saveBlobAsFile(file);
      // </copied>
    }
  }

  // <copied from="../../../frontend/Settings/Contacts/ImportExport.svelte">
  protected async importVCard(account: Addressbook, file: File) {
    let fileContents = await file.text();
    let persons = convertVCardsToPersons(fileContents, () => account.newPerson(), ex => account.errorCallback(ex));
    account.persons.addAll(persons);
    for (let person of persons) {
      try {
        await person.save();
      } catch (ex) {
        account.errorCallback(ex);
      }
    }
    await account.save();
  }
  // </copied>

  // <copied from="../../../frontend/Settings/Calendar/ImportExport.svelte">
  protected async importICal(account: Calendar, file: File) {
    let fileContents = await file.text();
    let events = convertICalToEvents(fileContents, () => account.newEvent(), ex => account.errorCallback(ex));
    account.events.addAll(events);
    for (let event of events) {
      try {
        await event.save();
      } catch (ex) {
        account.errorCallback(ex);
      }
    }
    await account.save();
  }
  // </copied>
}
