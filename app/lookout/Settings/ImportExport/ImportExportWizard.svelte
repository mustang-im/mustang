<Dialog title={$t`Import and Export Wizard`}
  width="680px"
  height="500px"
  on:close>
  <hbox flex class="wizard">
    <vbox class="wizard-art">
      <ImportExportIcon size={56} strokeWidth={1} />
    </vbox>
    <vbox flex class="wizard-page">
      {#if step == "action"}
        <label for="import-export-actions">{$t`Choose an action to perform:`}</label>
        <vbox class="choice-list" id="import-export-actions" role="listbox">
          {#each actions as actionEntry (actionEntry.id)}
            <button class="choice" class:selected={action == actionEntry.id}
              role="option" aria-selected={action == actionEntry.id}
              on:click={() => action = actionEntry.id}
              on:dblclick={() => catchErrors(next)}>
              <svelte:component this={actionEntry.icon} size={16} />
              {actionEntry.label}
            </button>
          {/each}
        </vbox>
        <fieldset class="description">
          <legend>{$t`Description`}</legend>
          {actions.find(actionEntry => actionEntry.id == action)?.description}
        </fieldset>
      {:else if step == "file-type"}
        <label for="import-export-types">{$t`Create a file of type:`}</label>
        <vbox class="choice-list" id="import-export-types" role="listbox">
          {#each fileTypes as fileTypeEntry (fileTypeEntry.id)}
            <button class="choice" class:selected={fileType == fileTypeEntry.id}
              role="option" aria-selected={fileType == fileTypeEntry.id}
              on:click={() => fileType = fileTypeEntry.id}
              on:dblclick={() => catchErrors(next)}>
              <svelte:component this={fileTypeEntry.icon} size={16} />
              {fileTypeEntry.label}
            </button>
          {/each}
        </vbox>
      {:else if step == "file"}
        <label for="import-export-file">{$t`File to import:`}</label>
        <hbox class="file-row">
          <input id="import-export-file" class="lo-text-field" type="text" readonly
            value={file?.name ?? ""} placeholder={$t`Click Browse… to choose a file`} />
          <DialogButton label={$t`Browse…`} onClick={onBrowse} />
        </hbox>
        <FileSelector bind:this={fileSelector}
          acceptFileTypes={action == "import-vcard" ? [ "text/vcard", ".vcf" ] : [ "text/calendar", ".ics", ".vcs" ]} />
      {:else if step == "folder"}
        <label for="import-export-folders">{action == "export"
          ? $t`Select the folder to export from:`
          : $t`Select the destination folder:`}</label>
        <vbox class="choice-list folders" id="import-export-folders" role="listbox">
          {#each folders as folderEntry (folderEntry.id)}
            <button class="choice" class:selected={folder == folderEntry}
              role="option" aria-selected={folder == folderEntry}
              on:click={() => folder = folderEntry}
              on:dblclick={() => { folder = folderEntry; catchErrors(finish); }}>
              <svelte:component this={worksOnCalendars ? CalendarIcon : AddressbookIcon} size={16} />
              <span class="folder-name">{folderEntry.name}</span>
              {#if folderEntry.mainAccount}
                <span class="lo-secondary">{folderEntry.mainAccount.name}</span>
              {/if}
            </button>
          {:else}
            <hbox class="empty">{worksOnCalendars
              ? $t`You don't have a calendar yet.`
              : $t`You don't have an address book yet.`}</hbox>
          {/each}
        </vbox>
      {/if}
    </vbox>
  </hbox>
  <svelte:fragment slot="footer">
    <hbox flex />
    <DialogButton label={$t`< Back`} disabled={stepIndex == 0} onClick={() => { step = steps[stepIndex - 1]; }} />
    {#if stepIndex == steps.length - 1}
      <DialogButton label={$t`Finish`} primary disabled={!canGoNext} onClick={finish} />
    {:else}
      <DialogButton label={$t`Next >`} primary disabled={!canGoNext} onClick={next} />
    {/if}
    <DialogButton label={$t`Cancel`} onClick={() => { dispatch("close"); }} />
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import type { ImportExportAction } from "../SettingsDialogs";
  import { SettingsDialogs } from "../SettingsDialogs";
  import { Addressbook } from "../../../logic/Contacts/Addressbook";
  import { Calendar } from "../../../logic/Calendar/Calendar";
  import { convertVCardsToPersons, personsToVCardFile } from "../../../logic/Contacts/VCard/VCard";
  import { convertICalToEvents } from "../../../logic/Calendar/ICal/ICalToEvent";
  import { eventsToICalFile } from "../../../logic/Calendar/ICal/ICalGenerator";
  import { saveBlobAsFile } from "../../../frontend/Util/util";
  import { appGlobal } from "../../../logic/app";
  import { catchErrors } from "../../../frontend/Util/error";
  import { assert } from "../../../logic/util/util";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import FileSelector from "../../../frontend/Mail/Composer/Attachments/FileSelector.svelte";
  import ImportExportIcon from "lucide-svelte/icons/arrow-left-right";
  import ExportIcon from "lucide-svelte/icons/file-output";
  import ImportIcon from "lucide-svelte/icons/file-input";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import { createEventDispatcher } from "svelte";
  import { gt, t } from "../../../l10n/l10n";

  export let preselected: Calendar | Addressbook | null = null;
  export let action: ImportExportAction | null = null;

  const dispatch = createEventDispatcher<{ close: void }>();

  let fileType: "ical" | "vcard" = preselected instanceof Addressbook ? "vcard" : "ical";
  let file: File | null = null;
  let folder: Calendar | Addressbook | null = preselected;
  let fileSelector: FileSelector;

  let step = action ? (action == "export" ? "file-type" : "file") : "action";
  action ??= "export";
  $: steps = action == "export" ? ["action", "file-type", "folder"] : ["action", "file", "folder"];
  $: stepIndex = steps.indexOf(step);
  $: worksOnCalendars = action == "import-ical" || action == "export" && fileType == "ical";
  $: folders = (worksOnCalendars ? appGlobal.calendars.contents : appGlobal.addressbooks.contents) as (Calendar | Addressbook)[];
  $: canGoNext =
    step == "file" ? !!file :
    step == "folder" ? folders.includes(folder) :
    true;

  $: actions = [
    { id: "export", icon: ExportIcon, label: $t`Export to a file`,
      description: $t`Export a calendar to an iCalendar file or an address book to a vCard file, for use in other programs.` },
    { id: "import-vcard", icon: ImportIcon, label: $t`Import a VCARD file (.vcf)`,
      description: $t`Import the contacts of a vCard file into one of your address books.` },
    { id: "import-ical", icon: ImportIcon, label: $t`Import an iCalendar (.ics) or vCalendar file (.vcs)`,
      description: $t`Import the appointments and meetings of an iCalendar or vCalendar file into one of your calendars.` },
    { id: "import-program", icon: ImportIcon, label: $t`Import from another program or file`,
      description: $t`Import e-mail accounts and address books from another program on this computer.` },
  ] as { id: ImportExportAction, icon: ConstructorOfATypedSvelteComponent, label: string, description: string }[];
  $: fileTypes = [
    { id: "ical", icon: CalendarIcon, label: $t`iCalendar (.ics)` },
    { id: "vcard", icon: AddressbookIcon, label: $t`vCard (.vcf)` },
  ] as { id: "ical" | "vcard", icon: ConstructorOfATypedSvelteComponent, label: string }[];

  function next() {
    if (action == "import-program") {
      SettingsDialogs.openSetup("/setup/initial");
      return;
    }
    step = steps[stepIndex + 1];
  }

  async function onBrowse() {
    file = await fileSelector.selectFile() ?? file;
  }

  async function finish() {
    assert(folders.includes(folder), gt`Please choose a folder first`);
    if (action == "export") {
      await exportFolder(folder);
    } else if (action == "import-vcard") {
      await importVCard(folder as Addressbook, file);
    } else {
      await importICal(folder as Calendar, file);
    }
    dispatch("close");
  }

  async function exportFolder(folder: Calendar | Addressbook) {
    if (folder instanceof Calendar) {
      // <copied from="../../../frontend/Settings/Calendar/ImportExport.svelte">
      let file = await eventsToICalFile(folder.events, folder.name);
      await saveBlobAsFile(file);
      // </copied>
    } else {
      // <copied from="../../../frontend/Settings/Contacts/ImportExport.svelte">
      let file = personsToVCardFile(folder.persons, folder.name);
      await saveBlobAsFile(file);
      // </copied>
    }
  }

  // <copied from="../../../frontend/Settings/Contacts/ImportExport.svelte">
  async function importVCard(account: Addressbook, file: File) {
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
  async function importICal(account: Calendar, file: File) {
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
</script>

<style>
  .wizard {
    gap: 20px;
    height: 100%;
    min-height: 0;
  }
  .wizard-art {
    flex-shrink: 0;
    align-items: center;
    justify-content: start;
    width: 120px;
    padding-block-start: 24px;
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-accent-tint);
    color: var(--lo-accent-text);
  }
  .wizard-page {
    min-width: 0;
    min-height: 0;
    gap: 8px;
  }
  .choice-list {
    flex: 0 1 auto;
    min-height: 120px;
    max-height: 200px;
    padding: 2px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    overflow-y: auto;
  }
  .choice-list.folders {
    flex: 1 1 auto;
    max-height: none;
  }
  .choice {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
    gap: 8px;
    height: 30px;
    padding: 0 8px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    text-align: start;
    cursor: default;
  }
  .choice :global(svg) {
    flex-shrink: 0;
    color: var(--lo-accent-text);
  }
  .choice:hover {
    background-color: var(--lo-hover-bg);
  }
  .choice.selected {
    background-color: var(--lo-selected-bg);
  }
  .folder-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .description {
    margin: 8px 0 0 0;
    padding: 4px 12px 12px 12px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    color: var(--lo-fg-secondary);
  }
  .description legend {
    padding: 0 4px;
    color: var(--lo-fg);
  }
  .file-row {
    align-items: center;
    gap: 8px;
  }
  .file-row input {
    flex: 1;
    min-width: 0;
  }
  .empty {
    padding: 12px 8px;
    color: var(--lo-fg-secondary);
  }
  </style>
