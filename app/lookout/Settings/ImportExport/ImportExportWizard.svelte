<Dialog title={$t`Import and Export Wizard`}
  width="680px"
  height="500px"
  on:close>
  <hbox flex class="wizard">
    <vbox class="wizard-art">
      <ImportExportIcon size={56} strokeWidth={1} />
    </vbox>
    <vbox flex class="wizard-page">
      {#if flow.step == "action"}
        <label for="import-export-actions">{$t`Choose an action to perform:`}</label>
        <vbox class="choice-list" id="import-export-actions" role="listbox">
          {#each actions as action (action.id)}
            <button class="choice" class:selected={flow.action == action.id}
              role="option" aria-selected={flow.action == action.id}
              on:click={() => { flow.action = action.id; flow = flow; }}
              on:dblclick={next}>
              <svelte:component this={action.icon} size={16} />
              {action.label}
            </button>
          {/each}
        </vbox>
        <fieldset class="description">
          <legend>{$t`Description`}</legend>
          {actions.find(action => action.id == flow.action)?.description}
        </fieldset>
      {:else if flow.step == "file-type"}
        <label for="import-export-types">{$t`Create a file of type:`}</label>
        <vbox class="choice-list" id="import-export-types" role="listbox">
          {#each fileTypes as fileType (fileType.id)}
            <button class="choice" class:selected={flow.fileType == fileType.id}
              role="option" aria-selected={flow.fileType == fileType.id}
              on:click={() => { flow.fileType = fileType.id; flow = flow; }}
              on:dblclick={next}>
              <svelte:component this={fileType.icon} size={16} />
              {fileType.label}
            </button>
          {/each}
        </vbox>
      {:else if flow.step == "file"}
        <label for="import-export-file">{$t`File to import:`}</label>
        <hbox class="file-row">
          <input id="import-export-file" class="lo-text-field" type="text" readonly
            value={flow.file?.name ?? ""} placeholder={$t`Click Browse… to choose a file`} />
          <DialogButton label={$t`Browse…`} onClick={onBrowse} />
        </hbox>
        <FileSelector bind:this={fileSelector}
          acceptFileTypes={flow.action == "import-vcard" ? [ "text/vcard", ".vcf" ] : [ "text/calendar", ".ics", ".vcs" ]} />
      {:else if flow.step == "folder"}
        <label for="import-export-folders">{flow.action == "export"
          ? $t`Select the folder to export from:`
          : $t`Select the destination folder:`}</label>
        <vbox class="choice-list folders" id="import-export-folders" role="listbox">
          {#each folders as folder (folder.id)}
            <button class="choice" class:selected={flow.folder == folder}
              role="option" aria-selected={flow.folder == folder}
              on:click={() => { flow.folder = folder; flow = flow; }}
              on:dblclick={() => { flow.folder = folder; flow = flow; catchErrors(finish); }}>
              <svelte:component this={flow.worksOnCalendars ? CalendarIcon : AddressbookIcon} size={16} />
              <span class="folder-name">{folder.name}</span>
              {#if folder.mainAccount}
                <span class="lo-secondary">{folder.mainAccount.name}</span>
              {/if}
            </button>
          {:else}
            <hbox class="empty">{flow.worksOnCalendars
              ? $t`You don't have a calendar yet.`
              : $t`You don't have an address book yet.`}</hbox>
          {/each}
        </vbox>
      {/if}
    </vbox>
  </hbox>
  <svelte:fragment slot="footer">
    <hbox flex />
    <DialogButton label={$t`< Back`} disabled={flow.isFirstStep} onClick={back} />
    {#if flow.isLastStep}
      <DialogButton label={$t`Finish`} primary disabled={!flow.canGoNext} onClick={finish} />
    {:else}
      <DialogButton label={$t`Next >`} primary disabled={!flow.canGoNext} onClick={next} />
    {/if}
    <DialogButton label={$t`Cancel`} onClick={close} />
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import type { Addressbook } from "../../../logic/Contacts/Addressbook";
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import { ImportExportFlow, type ImportExportAction, type ExportFileType } from "./ImportExportFlow";
  import { appGlobal } from "../../../logic/app";
  import { catchErrors } from "../../../frontend/Util/error";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import FileSelector from "../../../frontend/Mail/Composer/Attachments/FileSelector.svelte";
  import ImportExportIcon from "lucide-svelte/icons/arrow-left-right";
  import ExportIcon from "lucide-svelte/icons/file-output";
  import ImportIcon from "lucide-svelte/icons/file-input";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let preselected: Calendar | Addressbook | null = null;

  const dispatch = createEventDispatcher<{ close: void }>();

  let flow = new ImportExportFlow(preselected);
  let fileSelector: FileSelector;

  $: actions = [
    { id: "export", icon: ExportIcon, label: $t`Export to a file`,
      description: $t`Export a calendar to an iCalendar file or an address book to a vCard file, for use in other programs.` },
    { id: "import-ical", icon: ImportIcon, label: $t`Import an iCalendar (.ics) or vCalendar file (.vcs)`,
      description: $t`Import the appointments and meetings of an iCalendar or vCalendar file into one of your calendars.` },
    { id: "import-vcard", icon: ImportIcon, label: $t`Import a VCARD file (.vcf)`,
      description: $t`Import the contacts of a vCard file into one of your address books.` },
  ] as { id: ImportExportAction, icon: ConstructorOfATypedSvelteComponent, label: string, description: string }[];
  $: fileTypes = [
    { id: "ical", icon: CalendarIcon, label: $t`iCalendar (.ics)` },
    { id: "vcard", icon: AddressbookIcon, label: $t`vCard (.vcf)` },
  ] as { id: ExportFileType, icon: ConstructorOfATypedSvelteComponent, label: string }[];
  $: folders = (flow.worksOnCalendars ? appGlobal.calendars.contents : appGlobal.addressbooks.contents) as (Calendar | Addressbook)[];

  function next() {
    flow.next();
    flow = flow;
  }

  function back() {
    flow.back();
    flow = flow;
  }

  async function onBrowse() {
    let file = await fileSelector.selectFile();
    if (file) {
      flow.file = file;
      flow = flow;
    }
  }

  async function finish() {
    await flow.finish();
    close();
  }

  function close() {
    dispatch("close");
  }
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
