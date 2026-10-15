<FileDropTarget on:add-files={dropped => catchErrors(() => onFilesDrop(dropped))}>
  <vbox flex class="event-form">
    <InfoBar {messages} />
    <hbox class="header">
      {#if isMeeting}
        <SendButton label={sendLabel} disabled={sendDisabled} onClick={onSend} />
      {/if}
      <grid class="fields">
        <label class="row-label plain" for="event-form-title">{$t`Title`}</label>
        <input id="event-form-title" class="field title" type="text" bind:value={event.title}
          autofocus={!event.title} />
        {#if isMeeting}
          <button class="field-button" on:click={onAddressBook}
            title={$t`Select attendees from the address book`}>
            {$t`Required`}
          </button>
          <hbox class="field attendees">
            <AttendeesField {event} bind:this={attendeesField} autofocus={!!event.title && !flow.attendees.length} />
          </hbox>
        {/if}
        <TimeRows {event} editor={timeEditor} {flow} {onRecurrence} />
        <label class="field-button" for="event-form-location">{$t`Location`}</label>
        <input id="event-form-location" class="field location" type="text" bind:value={event.location} />
        {#if $event.isOnline}
          <span class="row-label">{$t`Online meeting`}</span>
          <OnlineMeetingRow {event} />
        {/if}
      </grid>
    </hbox>
    {#if $attachments.hasItems}
      <hbox class="attachments">
        {#each $attachments.each as attachment (attachment)}
          <vbox class="attachment-card">
            <AttachmentEntry {attachment} {attachments} />
          </vbox>
        {/each}
      </hbox>
    {/if}
    <vbox flex class="body">
      <!-- Binding `descriptionHTML` would re-set the editor content on every change, see frontend DescriptionBox -->
      <HTMLEditor bind:html={event.rawHTMLDangerous} bind:editor />
    </vbox>
  </vbox>
</FileDropTarget>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { EventEditFlow } from "./EventEditFlow";
  import type { EventTimeEditor } from "./EventTimeEditor";
  import type { InfoMessage } from "./EventFormInfo";
  import { addFilesAsAttachments } from "../../../logic/Abstract/Attachment";
  import InfoBar from "./InfoBar.svelte";
  import SendButton from "./SendButton.svelte";
  import TimeRows from "./TimeRows.svelte";
  import AttendeesField from "./AttendeesField.svelte";
  import OnlineMeetingRow from "./OnlineMeetingRow.svelte";
  import HTMLEditor from "../../../frontend/Shared/Editor/HTMLEditor.svelte";
  import AttachmentEntry from "../../../frontend/Mail/Composer/Attachments/AttachmentEntry.svelte";
  import FileDropTarget from "../../../frontend/Mail/Composer/Attachments/FileDropTarget.svelte";
  import { catchErrors } from "../../../frontend/Util/error";
  import type { Editor } from "@tiptap/core";
  import { t } from "../../../l10n/l10n";

  export let event: Event;
  export let flow: EventEditFlow;
  export let timeEditor: EventTimeEditor;
  export let messages: InfoMessage[];
  export let editor: Editor = null;
  export let sendLabel: string;
  export let sendDisabled: string | false = false;
  export let onSend: () => Promise<void>;
  export let onRecurrence: () => void;
  export let onAddressBook: () => void;

  let attendeesField: AttendeesField;

  $: participants = event.participants;
  $: isMeeting = $participants.hasItems;
  $: attachments = event.attachments;

  export function focusAttendees() {
    attendeesField?.focus();
  }

  function onFilesDrop(dropped: CustomEvent) {
    addFilesAsAttachments(event, dropped.detail.files as File[]);
  }
</script>

<style>
  .event-form {
    min-height: 0;
    overflow-y: auto;
  }
  .header {
    flex-shrink: 0;
    align-items: start;
    gap: 16px;
    padding: 8px 24px 12px 24px;
    border-block-end: 1px solid var(--lo-divider);
  }
  .fields {
    flex: 1 1 0;
    min-width: 0;
    grid-template-columns: max-content 1fr;
    align-items: center;
    column-gap: 12px;
    row-gap: 8px;
  }
  .fields :global(.row-label),
  .row-label {
    min-width: 80px;
    color: var(--lo-fg-secondary);
    text-align: end;
    white-space: nowrap;
  }
  .field-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 80px;
    height: 32px;
    padding: 0 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    font: inherit;
    cursor: pointer;
  }
  .field-button:hover {
    background-color: var(--lo-hover-bg);
    border-color: var(--lo-border-strong);
  }
  .field {
    min-width: 0;
    min-height: 32px;
    border: none;
    border-block-end: 1px solid var(--lo-input-border);
    border-radius: 0;
    background: none;
    color: var(--lo-fg);
    font: inherit;
  }
  input.field {
    padding: 0 4px;
    outline: none;
    box-shadow: none;
  }
  .field:focus-within,
  input.field:focus {
    border-block-end-color: var(--lo-accent);
    box-shadow: 0 1px 0 0 var(--lo-accent);
  }
  .field.title {
    font-size: 18px;
  }
  .field.attendees {
    align-items: center;
  }
  .attachments {
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 24px;
    border-block-end: 1px solid var(--lo-divider);
  }
  .attachment-card {
    width: 220px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
  }
  .body {
    flex: 1 0 auto;
    min-height: 160px;
    padding: 12px 24px;
  }
  .body > :global(*) {
    flex: 1 0 auto;
  }
  .body :global(.ProseMirror) {
    min-height: 136px;
    outline: none;
  }
</style>
