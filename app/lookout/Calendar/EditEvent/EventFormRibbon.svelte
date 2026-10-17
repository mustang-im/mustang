<Ribbon>
  <RibbonTab label={tabLabel}>
    {#if isIncoming}
      <RibbonGroup label={$t`Respond`}>
        {#if $event.isCancelled}
          <RibbonButton label={$t`Remove from Calendar`} icon={RemoveIcon}
            onClick={actions.onDelete} />
        {:else}
          <RibbonMenuButton label={$t`Accept`} icon={AcceptIcon} classes="accept">
            <MenuItem label={$t`Send the Response Now`} icon={SendIcon}
              checked={$event.myParticipation == InvitationResponse.Accept}
              onClick={() => flow.respond(InvitationResponse.Accept)} />
          </RibbonMenuButton>
          <RibbonMenuButton label={$t`Tentative`} icon={TentativeIcon} classes="tentative">
            <MenuItem label={$t`Send the Response Now`} icon={SendIcon}
              checked={$event.myParticipation == InvitationResponse.Tentative}
              onClick={() => flow.respond(InvitationResponse.Tentative)} />
          </RibbonMenuButton>
          <RibbonMenuButton label={$t`Decline`} icon={DeclineIcon} classes="decline">
            <MenuItem label={$t`Send the Response Now`} icon={SendIcon}
              checked={$event.myParticipation == InvitationResponse.Decline}
              onClick={() => flow.respond(InvitationResponse.Decline)} />
          </RibbonMenuButton>
        {/if}
      </RibbonGroup>
      <RibbonGroup label={$t`Actions`}>
        {#if isInstance}
          <RibbonMenuButton label={$t`Delete`} icon={DeleteIcon}>
            <MenuItem label={$t`Delete Occurrence`} icon={DeleteIcon} onClick={actions.onDelete} />
            <MenuItem label={$t`Delete Series`} icon={DeleteIcon} onClick={actions.onDeleteSeries} />
          </RibbonMenuButton>
        {:else}
          <RibbonButton label={$t`Delete`} icon={DeleteIcon}
            disabled={$event.isCancelled && $t`Use Remove from Calendar`}
            tooltip={$t`Delete the meeting and decline it`}
            onClick={actions.onDelete} />
        {/if}
        <RibbonButton label={$t`Forward`} icon={ForwardIcon} shortCutInfo="Ctrl+F"
          onClick={() => flow.forward()} />
      </RibbonGroup>
      <RibbonGroup label={$t`Calendar`}>
        <RibbonButton label={$t`Calendar…`} icon={CalendarIcon}
          tooltip={$t`Show this day in the calendar`}
          onClick={() => flow.showInCalendar()} />
      </RibbonGroup>
      {#if $event.isOnline}
        <RibbonGroup label={$t`Online Meeting`}>
          <RibbonButton label={$t`Join Online Meeting`} icon={JoinIcon}
            disabled={!$event.onlineMeetingURL && $t`This meeting has no link to an online meeting`}
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
      <RibbonGroup label={$t`Online Meeting`}>
        {#if $event.isOnline}
          <RibbonButton label={$t`Join Online Meeting`} icon={JoinIcon}
            disabled={!$event.onlineMeetingURL && $t`The link is created when you send the invitation`}
            onClick={() => flow.joinOnlineMeeting()} />
          <RibbonButton label={$t`Don't Host Online`} icon={OfflineIcon}
            tooltip={$t`Remove the online meeting`}
            onClick={onOffline} />
        {:else}
          <RibbonMenuButton label={$t`Online Meeting`} shortLabel={$t`Online *=> Online meeting`} icon={OnlineMeetingIcon}
            tooltip={$t`Add a link to an online meeting`}>
            {#each $meetAccounts.each as account}
              <MenuItem label={account.name} icon={OnlineMeetingIcon}
                onClick={() => onOnline(account)} />
            {/each}
            {#if $meetAccounts.hasItems}
              <MenuDivider />
            {/if}
            <MenuItem label={$t`Paste a Meeting Link`} icon={LinkIcon}
              onClick={() => onOnline(null)} />
          </RibbonMenuButton>
        {/if}
      </RibbonGroup>
      <RibbonGroup label={$t`Attendees`}>
        {#if isMeeting}
          <RibbonButton label={$t`Address Book`} icon={AddressBookIcon}
            tooltip={$t`Select attendees from the address book`}
            onClick={actions.onAddressBook} />
          <RibbonButton label={$t`Check Names`} icon={CheckNamesIcon}
            tooltip={$t`Check the names you typed against your address books`}
            onClick={actions.onCheckNames} />
        {:else}
          <RibbonButton label={$t`Invite Attendees`} icon={InviteIcon}
            tooltip={$t`Turn this appointment into a meeting`}
            onClick={actions.onInviteAttendees} />
        {/if}
      </RibbonGroup>
      <RibbonGroup label={$t`Options`}>
        <RibbonMenuButton label={$t`Reminder: ${reminderLabel.replaceAll(" ", "\u00A0")}`} shortLabel={reminderMinutes == null ? $t`Reminder` : reminderLabel} icon={ReminderIcon}
          tooltip={$t`Reminder: ${reminderLabel}`}>
          {#each reminderChoices as minutes}
            <MenuItem label={Reminder.label(minutes)} checked={minutes == reminderMinutes}
              onClick={() => Reminder.setMinutesBefore(event, minutes)} />
          {/each}
        </RibbonMenuButton>
        <RibbonButton label={$t`Recurrence`} icon={RecurrenceIcon} shortCutInfo="Ctrl+G"
          onClick={actions.onRecurrence} />
      </RibbonGroup>
    {/if}
  </RibbonTab>

  {#if canSchedule && isMeeting && !isIncoming}
    <RibbonTab label={schedulingLabel} bind:isSelected={isSchedulingSelected}>
      <RibbonGroup label={$t`Scheduling`}>
        <RibbonButton label={$t`Refresh Availability`} icon={RefreshIcon}
          onClick={actions.onRefreshAvailability} />
      </RibbonGroup>
      <RibbonGroup label={$t`Attendees`}>
        <RibbonButton label={$t`Add Attendees`} icon={AddAttendeesIcon}
          tooltip={$t`Select attendees from the address book`}
          onClick={actions.onAddressBook} />
      </RibbonGroup>
    </RibbonTab>
  {/if}
  {#if isSent}
    <RibbonTab label={trackingLabel} bind:isSelected={isTrackingSelected}>
      <RibbonGroup label={$t`Tracking`}>
        <RibbonButton label={$t`Copy Status to Clipboard`} icon={CopyIcon}
          onClick={() => navigator.clipboard.writeText(EventFormInfo.trackingText(event))} />
      </RibbonGroup>
    </RibbonTab>
  {/if}
  {#if !isIncoming}
    <InsertTab {editor} bind:openedTool {onAttachFile} bind:showEmojis>
      <svelte:fragment slot="include">
        <RibbonMenuButton label={$t`Signature`} icon={SignatureIcon}>
          <SignatureMenuItems identity={null} {editor} onSignatures={actions.onSignatures} />
        </RibbonMenuButton>
      </svelte:fragment>
    </InsertTab>
    <FormatTextTab {editor} bind:openedTool />
    <ReviewTab {editor} bind:openedTool />
  {/if}
</Ribbon>

<script lang="ts" context="module">
  export interface EventFormActions {
    onSave: () => Promise<void>;
    onDelete: () => Promise<void>;
    onDeleteRemainder: () => Promise<void>;
    onDeleteSeries: () => Promise<void>;
    onInviteAttendees: () => void;
    onAddressBook: () => void;
    onCheckNames: () => Promise<void>;
    onRecurrence: () => void;
    onRefreshAvailability: () => void;
    onSignatures: () => void;
  }
</script>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import { EventFormInfo } from "./EventFormInfo";
  import { Reminder } from "./Reminder";
  import Ribbon from "../../Shared/Ribbon/Ribbon.svelte";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import RibbonMenuButton from "../../Shared/Ribbon/RibbonMenuButton.svelte";
  import InsertTab from "../../Shared/Editor/InsertTab.svelte";
  import FormatTextTab from "../../Shared/Editor/FormatTextTab.svelte";
  import ReviewTab from "../../Shared/Editor/ReviewTab.svelte";
  import type { EditorTool } from "../../Shared/Editor/EditorCommands";
  import type { Editor } from "@tiptap/core";
  import SignatureMenuItems from "../../Mail/Composer/SignatureMenuItems.svelte";
  import type { MeetAccount } from "../../../logic/Meet/MeetAccount";
  import { EventEditFlow } from "./EventEditFlow";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
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
  import OfflineIcon from "lucide-svelte/icons/video-off";
  import LinkIcon from "lucide-svelte/icons/link";
  import SendIcon from "lucide-svelte/icons/send";
  import CalendarIcon from "lucide-svelte/icons/calendar-days";
  import CheckNamesIcon from "lucide-svelte/icons/user-check";
  import AddressBookIcon from "lucide-svelte/icons/book-user";
  import InviteIcon from "lucide-svelte/icons/users-round";
  import AddAttendeesIcon from "lucide-svelte/icons/user-round-plus";
  import ReminderIcon from "lucide-svelte/icons/bell";
  import RecurrenceIcon from "lucide-svelte/icons/repeat-2";
  import RefreshIcon from "lucide-svelte/icons/refresh-cw";
  import SignatureIcon from "lucide-svelte/icons/pen-line";
  import CopyIcon from "lucide-svelte/icons/clipboard-copy";
  import { t } from "../../../l10n/l10n";

  export let event: Event;
  export let flow: EventEditFlow;
  export let editor: Editor;
  export let openedTool: EditorTool | null = null;
  export let onAttachFile: () => Promise<void>;
  export let showEmojis = false;
  export let actions: EventFormActions;
  export let saveDisabled: string | false = false;
  export let canSchedule = false;
  export let schedulingLabel: string;
  export let trackingLabel: string;
  export let isSchedulingSelected = false;
  export let isTrackingSelected = false;

  $: participants = event.participants;
  $: isMeeting = $participants.hasItems;
  $: isIncoming = $event.isIncomingMeeting;
  $: isInstance = !!$event.parentEvent;
  $: isSent = $event.isOutgoingMeeting && $event && flow.isSaved;
  $: tabLabel = $event && EventFormInfo.tabLabel(event);
  $: reminderMinutes = $event && Reminder.minutesBefore(event);
  $: reminderLabel = Reminder.label(reminderMinutes);
  $: reminderChoices = Reminder.choices(reminderMinutes);
  const meetAccounts = EventEditFlow.meetAccounts();

  function onOnline(account: MeetAccount | null) {
    flow.setOnlineWith(account);
    event.notifyObservers();
  }

  async function onOffline() {
    await flow.setOffline();
    event.notifyObservers();
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
