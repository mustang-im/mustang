<vbox flex class="event-form-page" on:keydown={onKeyDown}>
  {#key ribbonKey}
    <EventFormRibbon {event} {flow} {editorCommands} {actions} {saveDisabled} {canSchedule}
      {schedulingLabel} {trackingLabel}
      bind:showEmojis bind:selectedLabel />
  {/key}
  <vbox flex class="form-card lo-card">
    <hbox class="title-row">
      <h1>
        <span class="title">{$event.title || $t`Untitled`}</span>
        <span class="kind">– {kindLabel}</span>
      </h1>
      <hbox class="calendar-name lo-secondary" title={$t`Calendar`}>
        <span class="dot" style:background-color={$calendar?.color ?? "var(--lo-accent)"} />
        {$calendar?.name ?? ""}
      </hbox>
      <hbox flex />
      {#if showsEditor}
        <UndoRedoButtons {editor} />
      {/if}
      <button class="close" title={$t`Close`} aria-label={$t`Close`} on:click={onCloseRequest}>
        <CloseIcon size={18} />
      </button>
    </hbox>
    {#if isIncoming}
      <InvitationForm {event} {flow} {messages} />
    {:else if showScheduling}
      <SchedulingAssistant {event} {flow} {timeEditor} bind:this={scheduling}
        {sendLabel} {sendDisabled} onSend={onSave} onRecurrence={openRecurrence} />
    {:else if showTracking}
      <TrackingView {event} />
    {:else}
      <EventForm {event} {flow} {timeEditor} {messages} bind:editor bind:showEmojis bind:this={form}
        {sendLabel} {sendDisabled} onSend={onSave} onRecurrence={openRecurrence}
        onAddressBook={openAddressBook} />
    {/if}
  </vbox>
</vbox>

{#if showRecurrenceDialog}
  <RecurrenceDialog {event} {flow} {timeEditor} onClose={onRecurrenceClosed} />
{/if}
{#if seriesChoice}
  <SeriesChoiceDialog title={seriesChoice.title} okLabel={seriesChoice.okLabel}
    choices={seriesChoice.choices} onChoose={seriesChoice.onChoose}
    onClose={() => seriesChoice = null} />
{/if}
{#if showSaveChanges}
  <SaveChangesDialog title={kindLabel} question={saveChangesText.question}
    saveLabel={saveChangesText.save} discardLabel={saveChangesText.discard}
    saveDisabled={flow.missingPropsReason ?? false}
    onSave={onSaveFromClose}
    onDiscard={onDiscard}
    onCancel={() => showSaveChanges = false} />
{/if}
{#if attendeesField}
  <SelectNamesDialog title={$t`Select Attendees and Resources`} fields={[attendeesField]}
    onOK={onAttendeesPicked} onCancel={() => attendeesField = null} />
{/if}
{#if showSignatures}
  <SignaturesDialog identity={event.calendar?.inviteAs} onDone={() => showSignatures = false} />
{/if}
<EditorToolDialogs {editor} bind:openedTool />
<FileSelector bind:this={fileSelector} />

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { addFilesAsAttachments } from "../../../logic/Abstract/Attachment";
  import { UserError } from "../../../logic/util/util";
  import { EventEditFlow, type SeriesChoice } from "./EventEditFlow";
  import { EventTimeEditor } from "./EventTimeEditor";
  import { EventFormInfo, type InfoMessage } from "./EventFormInfo";
  import EventFormRibbon, { type EventFormActions } from "./EventFormRibbon.svelte";
  import EventForm from "./EventForm.svelte";
  import InvitationForm from "./InvitationForm.svelte";
  import TrackingView from "./TrackingView.svelte";
  import RecurrenceDialog from "./RecurrenceDialog.svelte";
  import SeriesChoiceDialog from "./SeriesChoiceDialog.svelte";
  import SaveChangesDialog from "./SaveChangesDialog.svelte";
  import SchedulingAssistant from "../Scheduling/SchedulingAssistant.svelte";
  import SelectNamesDialog from "../../Mail/Composer/SelectNamesDialog.svelte";
  import SignaturesDialog from "../../Mail/Composer/SignaturesDialog.svelte";
  import { SelectNamesField } from "../../Mail/Composer/SelectNames";
  import { FreeBusy } from "../Scheduling/FreeBusy";
  import { EditorTool, type EditorCommands } from "../../Shared/Editor/EditorCommands";
  import { EditorShortcuts } from "../../Shared/Editor/EditorShortcuts";
  import EditorToolDialogs from "../../Shared/Editor/EditorToolDialogs.svelte";
  import UndoRedoButtons from "../../Shared/Editor/UndoRedoButtons.svelte";
  import FileSelector from "../../../frontend/Mail/Composer/Attachments/FileSelector.svelte";
  import { shownCalendarEvents } from "../../../frontend/Calendar/selected";
  import { catchErrors } from "../../../frontend/Util/error";
  import { Keyboard } from "../../Shared/Keyboard";
  import CloseIcon from "lucide-svelte/icons/x";
  import type { Editor } from "@tiptap/core";
  import { onMount, tick } from "svelte";
  import { gt, t } from "../../../l10n/l10n";

  export let event: Event;

  event.startEditing();
  const flow = new EventEditFlow(event);
  const timeEditor = new EventTimeEditor(event);
  const schedulingLabel = gt`Scheduling Assistant`;
  const trackingLabel = gt`Tracking`;

  let form: EventForm;
  let scheduling: SchedulingAssistant;
  let fileSelector: FileSelector;
  let editor: Editor = null;
  let openedTool: EditorTool | null = null;
  let showEmojis = false;
  let showSignatures = false;
  let selectedLabel: string = null;
  let showRecurrenceDialog = false;
  let showSaveChanges = false;
  let seriesChoice: {
    title: string,
    okLabel: string,
    choices: SeriesChoice[],
    onChoose: (choice: SeriesChoice) => Promise<void>,
  } = null;

  $: participants = event.participants;
  $: parentEvent = $event.parentEvent;
  $: calendar = $event.calendar;
  $: isMeeting = $participants.hasItems;
  $: isIncoming = $event.isIncomingMeeting;
  $: isSaved = $event && flow.isSaved;
  $: isSent = isMeeting && $event.isOutgoingMeeting && isSaved;
  $: ribbonKey = `${isMeeting}-${isSent}-${isIncoming}-${canSchedule}`;
  $: isMeeting && !isIncoming && checkScheduling();
  $: kindLabel = $event && $participants && EventFormInfo.tabLabel(event);
  $: showScheduling = canSchedule && isMeeting && !isIncoming && selectedLabel == schedulingLabel;
  $: showTracking = isSent && selectedLabel == trackingLabel;
  $: showsEditor = !isIncoming && !showScheduling && !showTracking;
  $: $event, $participants, $parentEvent, $shownCalendarEvents, updateState(editor);
  $: sendLabel = isSaved ? $t`Send Update` : $t`Send`;
  $: sendDisabled = saveDisabled || (isSaved && !hasChanges ? $t`There are no changes to send` : false);
  $: saveChangesText = changesText(isMeeting, isSaved);

  let messages: InfoMessage[] = [];
  let hasChanges = false;
  let saveDisabled: string | false = false;
  function updateState(_editor: Editor) {
    messages = EventFormInfo.messages(event, shownCalendarEvents.contents, new Date(), flow.pattern);
    hasChanges = flow.hasChanges;
    saveDisabled = flow.missingPropsReason ?? false;
  }

  let canSchedule = false;
  async function checkScheduling() {
    try {
      canSchedule = await FreeBusy.isSupported(event.calendar, event.participants.contents);
    } catch (ex) {
      canSchedule = true;
    }
  }

  onMount(() => {
    if (event.isNew && event.recurrenceRule && !event.parentEvent) {
      showRecurrenceDialog = true;
    }
  });

  const actions: EventFormActions = {
    onSave,
    onDelete,
    onDeleteRemainder: () => flow.deleteRemainder(),
    onDeleteSeries,
    onInviteAttendees,
    onAddressBook: openAddressBook,
    onCheckNames: async () => { await form?.checkNames(); },
    onRecurrence: openRecurrence,
    onRefreshAvailability: () => scheduling?.refresh(),
    onSignatures: () => { showSignatures = true; },
  };

  let editorCommands: EditorCommands;
  $: editorCommands = {
    editor,
    onAttachFile,
    onInsertPicture: null,
    openTool: (tool: EditorTool) => { openedTool = tool; },
  };

  function changesText(isMeeting: boolean, isSaved: boolean) {
    if (isMeeting && !isSaved) {
      return { question: gt`This meeting invitation has not been sent yet. Do you want to send it now?`, save: gt`Send`, discard: gt`Don't Send` };
    } else if (isMeeting) {
      return { question: gt`Do you want to send an update with your changes to the attendees?`, save: gt`Send Update`, discard: gt`Discard Changes` };
    }
    return { question: gt`Do you want to save changes?`, save: gt`Save`, discard: gt`Don't Save` };
  }

  async function onSave() {
    let reason = flow.missingPropsReason;
    if (reason) {
      throw new UserError(reason);
    }
    if (flow.needsSeriesChoice) {
      seriesChoice = {
        title: flow.isMeeting ? gt`Recurring Meeting` : gt`Recurring Appointment`,
        okLabel: flow.willSend ? gt`Send` : gt`Save`,
        choices: flow.seriesChoices(),
        onChoose: choice => flow.saveWith(choice),
      };
      return;
    }
    if (!flow.hasChanges || !flow.canSaveSingle) {
      flow.cancel();
      return;
    }
    await flow.save();
  }

  async function onSaveFromClose() {
    showSaveChanges = false;
    await onSave();
  }

  function onDiscard() {
    showSaveChanges = false;
    flow.cancel();
  }

  async function onDelete() {
    if (event.isNew && !event.parentEvent) {
      flow.cancel();
    } else if (event.isOutgoingMeeting && !event.isCancelled && flow.isSaved) {
      await flow.cancelMeeting();
    } else {
      await flow.deleteIt();
    }
  }

  async function onDeleteSeries() {
    if (event.isOutgoingMeeting && flow.isSaved) {
      await flow.cancelMeetingSeries();
    } else {
      await flow.deleteAll();
    }
  }

  async function onInviteAttendees() {
    flow.inviteAttendees();
    await tick();
    form?.focusAttendees();
  }

  let attendeesField: SelectNamesField = null;
  function openAddressBook() {
    attendeesField = new SelectNamesField(gt`Required`, flow.attendees);
  }

  function onAttendeesPicked() {
    flow.setAttendees(attendeesField.picks.contents);
    attendeesField = null;
  }

  function openRecurrence() {
    showRecurrenceDialog = true;
  }

  function onRecurrenceClosed() {
    showRecurrenceDialog = false;
    event.notifyObservers();
  }

  async function onAttachFile() {
    let files = await fileSelector.selectFiles();
    if (!files?.length) {
      return;
    }
    addFilesAsAttachments(event, files);
  }

  function onCloseRequest() {
    if (!isIncoming && flow.hasChanges) {
      showSaveChanges = true;
      return;
    }
    flow.cancel();
  }

  function onKeyDown(keyEvent: KeyboardEvent) {
    if (keyEvent.defaultPrevented || showRecurrenceDialog || showSaveChanges || seriesChoice || attendeesField || openedTool || showSignatures) {
      return;
    }
    let key = keyEvent.key.toLowerCase();
    let command: () => Promise<void> | void = null;
    let tool = showsEditor && editor ? EditorShortcuts.toolFor(keyEvent) : null;
    if (tool) {
      command = () => { openedTool = tool; };
    } else if (keyEvent.key == "Escape") {
      command = onCloseRequest;
    } else if (keyEvent.altKey && !keyEvent.ctrlKey && keyEvent.code == "KeyS" && !Keyboard.isMac && !isIncoming) {
      command = onSave;
    } else if (keyEvent.ctrlKey && !keyEvent.altKey && key == "g" && !isIncoming) {
      command = openRecurrence;
    } else if (keyEvent.ctrlKey && !keyEvent.altKey && key == "d" && !event.parentEvent) {
      command = onDelete;
    } else if (keyEvent.ctrlKey && !keyEvent.altKey && key == "f" && flow.isSaved) {
      command = () => flow.forward();
    }
    if (!command) {
      return;
    }
    keyEvent.preventDefault();
    keyEvent.stopPropagation();
    catchErrors(command);
  }
</script>

<style>
  .event-form-page {
    min-height: 0;
  }
  .form-card {
    min-height: 0;
    margin: 0 8px 8px 8px;
    overflow: hidden;
  }
  .form-card :global(.container),
  .form-card :global(.container > .content) {
    min-height: 0;
  }
  .title-row {
    flex-shrink: 0;
    align-items: center;
    gap: 16px;
    padding: 10px 12px 2px 24px;
  }
  h1 {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    font-size: var(--lo-font-size-large);
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .kind {
    margin-inline-start: 4px;
    font-weight: normal;
    color: var(--lo-fg-secondary);
  }
  .calendar-name {
    flex-shrink: 0;
    align-items: center;
    gap: 6px;
    font-size: var(--lo-font-size-small);
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg-secondary);
    cursor: pointer;
  }
  .close:hover {
    background-color: var(--lo-danger);
    color: var(--lo-danger-fg);
  }
</style>
