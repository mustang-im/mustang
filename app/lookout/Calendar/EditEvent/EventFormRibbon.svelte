<Ribbon>
  <RibbonTabWatcher bind:selectedLabel bind:this={tabWatcher} />
  <RibbonTab label={tabLabel}>
    {#if isIncoming}
      <RibbonGroup label={$t`Respond`}>
        {#if $event.isCancelled}
          <RibbonButton label={$t`Remove from Calendar`} icon={RemoveIcon}
            onClick={actions.onDelete} />
        {:else}
          <RibbonToggleButton label={$t`Accept`} icon={AcceptIcon} classes="accept"
            checked={$event.myParticipation == InvitationResponse.Accept}
            onChange={() => flow.respond(InvitationResponse.Accept)} />
          <RibbonToggleButton label={$t`Tentative`} icon={TentativeIcon} classes="tentative"
            checked={$event.myParticipation == InvitationResponse.Tentative}
            onChange={() => flow.respond(InvitationResponse.Tentative)} />
          <RibbonToggleButton label={$t`Decline`} icon={DeclineIcon} classes="decline"
            checked={$event.myParticipation == InvitationResponse.Decline}
            onChange={() => flow.respond(InvitationResponse.Decline)} />
        {/if}
      </RibbonGroup>
      <RibbonGroup label={$t`Actions`}>
        {#if isInstance}
          <RibbonMenuButton label={$t`Delete`} icon={DeleteIcon}>
            <MenuItem label={$t`Delete Series`} icon={DeleteIcon} onClick={actions.onDeleteSeries} />
          </RibbonMenuButton>
        {:else if !$event.isCancelled}
          <RibbonButton label={$t`Delete`} icon={DeleteIcon}
            tooltip={$t`Delete the meeting and decline it`}
            onClick={actions.onDelete} />
        {/if}
        <RibbonButton label={$t`Forward`} icon={ForwardIcon} shortCutInfo="Ctrl+F"
          onClick={() => flow.forward()} />
      </RibbonGroup>
      {#if $event.isOnline && $event.onlineMeetingURL}
        <RibbonGroup label={$t`Online`}>
          <RibbonButton label={$t`Join Online Meeting`} icon={JoinIcon}
            onClick={() => flow.joinOnlineMeeting()} />
        </RibbonGroup>
      {/if}
    {:else}
      <RibbonGroup label={$t`Actions`}>
        {#if !isMeeting}
          <RibbonButton label={$t`Save & Close`} icon={SaveIcon} shortCutInfo="Alt+S"
            disabled={saveDisabled}
            onClick={actions.onSave} />
        {/if}
        {#if isInstance}
          <RibbonMenuButton label={isSent ? $t`Cancel Meeting` : $t`Delete`} icon={isSent ? CancelIcon : DeleteIcon}>
            <MenuItem label={isSent ? $t`Cancel Occurrence` : $t`Delete Occurrence`} icon={isSent ? CancelIcon : DeleteIcon}
              onClick={actions.onDelete} />
            {#if $event.seriesStatus == "middle" && !isSent}
              <MenuItem label={$t`Delete This and Following`} icon={DeleteIcon}
                onClick={actions.onDeleteRemainder} />
            {/if}
            <MenuItem label={isSent ? $t`Cancel Series` : $t`Delete Series`} icon={isSent ? CancelIcon : DeleteIcon}
              onClick={actions.onDeleteSeries} />
          </RibbonMenuButton>
        {:else if isSent}
          <RibbonButton label={$t`Cancel Meeting`} icon={CancelIcon}
            tooltip={$t`Send a cancellation to all attendees and delete the meeting`}
            onClick={actions.onDelete} />
        {:else}
          <RibbonButton label={$t`Delete`} icon={DeleteIcon} shortCutInfo="Ctrl+D"
            onClick={actions.onDelete} />
        {/if}
        <RibbonButton label={$t`Forward`} icon={ForwardIcon} shortCutInfo="Ctrl+F"
          disabled={!flow.isSaved && (isMeeting ? $t`Send the meeting first` : $t`Save the appointment first`)}
          onClick={() => flow.forward()} />
      </RibbonGroup>
      <RibbonGroup label={$t`Online`}>
        <RibbonToggleButton label={$t`Online Meeting`} icon={OnlineMeetingIcon}
          tooltip={$t`Add a link to an online meeting`}
          checked={$event.isOnline}
          onChange={onOnlineMeeting} />
        {#if $event.isOnline && $event.onlineMeetingURL}
          <RibbonButton label={$t`Join Online Meeting`} icon={JoinIcon}
            onClick={() => flow.joinOnlineMeeting()} />
        {/if}
      </RibbonGroup>
      <RibbonGroup label={$t`Attendees`}>
        {#if isMeeting}
          <RibbonButton label={$t`Add Attendees`} icon={AddAttendeesIcon}
            onClick={actions.onAddAttendees} />
        {:else}
          <RibbonButton label={$t`Invite Attendees`} icon={InviteIcon}
            tooltip={$t`Turn this appointment into a meeting`}
            onClick={actions.onInviteAttendees} />
        {/if}
      </RibbonGroup>
      <RibbonGroup label={$t`Options`}>
        <RibbonMenuButton label={reminderLabel} icon={ReminderIcon}
          tooltip={$t`Reminder: ${reminderLabel}`}>
          {#each reminderChoices as minutes}
            <MenuItem label={Reminder.label(minutes)} selected={minutes == reminderMinutes}
              onClick={() => Reminder.setMinutesBefore(event, minutes)} />
          {/each}
        </RibbonMenuButton>
        <RibbonButton label={$t`Recurrence`} icon={RecurrenceIcon} shortCutInfo="Ctrl+G"
          onClick={actions.onRecurrence} />
      </RibbonGroup>
    {/if}
  </RibbonTab>

  {#if canSchedule && isMeeting && !isIncoming}
    <RibbonTab label={schedulingLabel}>
      <RibbonGroup label={$t`Scheduling`}>
        <RibbonButton label={$t`Refresh Availability`} icon={RefreshIcon}
          onClick={actions.onRefreshAvailability} />
      </RibbonGroup>
      <RibbonGroup label={$t`Attendees`}>
        <RibbonButton label={$t`Add Attendees`} icon={AddAttendeesIcon}
          onClick={actions.onAddAttendees} />
      </RibbonGroup>
    </RibbonTab>
  {/if}
  {#if isSent}
    <RibbonTab label={trackingLabel}>
      <RibbonGroup label={$t`Tracking`}>
        <RibbonButton label={$t`Copy Status to Clipboard`} icon={CopyIcon}
          onClick={() => navigator.clipboard.writeText(EventFormInfo.trackingText(event))} />
      </RibbonGroup>
    </RibbonTab>
  {/if}
  {#if !isIncoming}
    <RibbonTab label={$t`Insert`}>
      <RibbonGroup label={$t`Include`}>
        <RibbonButton label={$t`Attach File`} icon={AttachIcon}
          onClick={actions.onAttachFile} />
      </RibbonGroup>
    </RibbonTab>
    <RibbonTab label={$t`Format Text`}>
      <RibbonGroup label={$t`Font`} icon={BoldIcon}>
        <RibbonToggleButton label={$t`Bold`} icon={BoldIcon} shortCutInfo="Ctrl+B"
          checked={!!editor?.isActive("bold")} disabled={!editor}
          onChange={() => run(chain => chain.toggleBold())} />
        <RibbonToggleButton label={$t`Italic`} icon={ItalicIcon} shortCutInfo="Ctrl+I"
          checked={!!editor?.isActive("italic")} disabled={!editor}
          onChange={() => run(chain => chain.toggleItalic())} />
        <RibbonToggleButton label={$t`Strikethrough`} icon={StrikethroughIcon}
          checked={!!editor?.isActive("strike")} disabled={!editor}
          onChange={() => run(chain => chain.toggleStrike())} />
        <RibbonButton label={$t`Clear Formatting`} icon={ClearFormattingIcon}
          disabled={!editor}
          onClick={() => run(chain => chain.clearNodes().unsetAllMarks())} />
      </RibbonGroup>
      <RibbonGroup label={$t`Paragraph`} icon={BulletsIcon}>
        <RibbonToggleButton label={$t`Bullets`} icon={BulletsIcon}
          checked={!!editor?.isActive("bulletList")} disabled={!editor}
          onChange={() => run(chain => chain.toggleBulletList())} />
        <RibbonToggleButton label={$t`Numbering`} icon={NumberingIcon}
          checked={!!editor?.isActive("orderedList")} disabled={!editor}
          onChange={() => run(chain => chain.toggleOrderedList())} />
        <RibbonToggleButton label={$t`Quote`} icon={QuoteIcon}
          checked={!!editor?.isActive("blockquote")} disabled={!editor}
          onChange={() => run(chain => chain.toggleBlockquote())} />
      </RibbonGroup>
      <RibbonGroup label={$t`Editing`} icon={UndoIcon}>
        <RibbonButton label={$t`Undo`} icon={UndoIcon} shortCutInfo="Ctrl+Z"
          disabled={!editor?.can().undo()}
          onClick={() => run(chain => chain.undo())} />
        <RibbonButton label={$t`Redo`} icon={RedoIcon} shortCutInfo="Ctrl+Y"
          disabled={!editor?.can().redo()}
          onClick={() => run(chain => chain.redo())} />
      </RibbonGroup>
    </RibbonTab>
  {/if}
</Ribbon>

<script lang="ts" context="module">
  export interface EventFormActions {
    onSave: () => Promise<void>;
    onDelete: () => Promise<void>;
    onDeleteRemainder: () => Promise<void>;
    onDeleteSeries: () => Promise<void>;
    onInviteAttendees: () => void;
    onAddAttendees: () => void;
    onRecurrence: () => void;
    onRefreshAvailability: () => void;
    onAttachFile: () => Promise<void>;
  }
</script>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import type { EventEditFlow } from "./EventEditFlow";
  import { EventFormInfo } from "./EventFormInfo";
  import { Reminder } from "./Reminder";
  import Ribbon from "../../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonToggleButton from "../../Shared/Ribbon/RibbonToggleButton.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import RibbonTabWatcher from "./RibbonTabWatcher.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import SaveIcon from "lucide-svelte/icons/save";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import CancelIcon from "lucide-svelte/icons/calendar-x-2";
  import RemoveIcon from "lucide-svelte/icons/calendar-minus-2";
  import ForwardIcon from "lucide-svelte/icons/forward";
  import AcceptIcon from "lucide-svelte/icons/check";
  import TentativeIcon from "lucide-svelte/icons/circle-help";
  import DeclineIcon from "lucide-svelte/icons/x";
  import OnlineMeetingIcon from "lucide-svelte/icons/video";
  import JoinIcon from "lucide-svelte/icons/log-in";
  import InviteIcon from "lucide-svelte/icons/users-round";
  import AddAttendeesIcon from "lucide-svelte/icons/user-round-plus";
  import ReminderIcon from "lucide-svelte/icons/bell";
  import RecurrenceIcon from "lucide-svelte/icons/repeat-2";
  import RefreshIcon from "lucide-svelte/icons/refresh-cw";
  import CopyIcon from "lucide-svelte/icons/clipboard-copy";
  import AttachIcon from "lucide-svelte/icons/paperclip";
  import BoldIcon from "lucide-svelte/icons/bold";
  import ItalicIcon from "lucide-svelte/icons/italic";
  import StrikethroughIcon from "lucide-svelte/icons/strikethrough";
  import ClearFormattingIcon from "lucide-svelte/icons/remove-formatting";
  import BulletsIcon from "lucide-svelte/icons/list";
  import NumberingIcon from "lucide-svelte/icons/list-ordered";
  import QuoteIcon from "lucide-svelte/icons/text-quote";
  import UndoIcon from "lucide-svelte/icons/undo-2";
  import RedoIcon from "lucide-svelte/icons/redo-2";
  import type { ChainedCommands, Editor } from "@tiptap/core";
  import { t } from "../../../l10n/l10n";

  export let event: Event;
  export let flow: EventEditFlow;
  export let editor: Editor = null;
  export let actions: EventFormActions;
  export let saveDisabled: string | false = false;
  export let canSchedule = false;
  export let schedulingLabel: string;
  export let trackingLabel: string;
  export let selectedLabel: string = null;

  let tabWatcher: RibbonTabWatcher;

  $: participants = event.participants;
  $: isMeeting = $participants.hasItems;
  $: isIncoming = $event.isIncomingMeeting;
  $: isInstance = !!$event.parentEvent;
  $: isSent = $event.isOutgoingMeeting && $event && flow.isSaved;
  $: tabLabel = $event && EventFormInfo.tabLabel(event);
  $: reminderMinutes = $event && Reminder.minutesBefore(event);
  $: reminderLabel = reminderMinutes == null ? $t`No Reminder` : Reminder.label(reminderMinutes);
  $: reminderChoices = Reminder.choices(reminderMinutes);

  export function selectTab(label: string) {
    tabWatcher?.select(label);
  }

  export function selectFirstTab() {
    tabWatcher?.selectFirst();
  }

  function onOnlineMeeting(checked: boolean) {
    if (checked) {
      flow.setOnline();
    } else {
      flow.setOffline();
    }
    event.notifyObservers();
  }

  function run(command: (chain: ChainedCommands) => ChainedCommands) {
    command(editor.chain().focus()).run();
  }
</script>

<style>
  :global(.event-form-page .ribbon button.accept svg) {
    color: var(--lo-success);
  }
  :global(.event-form-page .ribbon button.decline svg) {
    color: var(--lo-danger);
  }
</style>
