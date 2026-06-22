<hbox class="invitation" bind:offsetWidth={width}>
  <vbox class="appointment">
    {#if $message.event}
      <InvitationDisplay event={$message.event} />
    {:else if $message.invitationMessage}
      {#await loadEvent(message)}
        {$t`Loading event...`}
      {:then}
        {#if $message.event}
          <InvitationDisplay event={$message.event} />
        {:else}
          {$t`No event found`}
        {/if}
      {:catch ex}
        {ex?.message ?? ex}
      {/await}
    {/if}
    {#if $message.invitationMessage == InvitationMessage.Invitation && incomingInvitation && calendars}
      <hbox class="calendar-selector">
        <AccountDropDown
          accounts={calendars}
          selectedAccount={selectedCalendar}
          on:select={ev => selectCalendar(ev.detail as Calendar)}
          filterByWorkspace={false}
          disabled={calendars.length <= 1}
          icon={AccountIcon}
          />
      </hbox>
    {/if}
    <hbox class="buttons">
      {#if $message.invitationMessage == InvitationMessage.Invitation && incomingInvitation}
        <InvitationButtons invitation={incomingInvitation} myParticipation={incomingInvitation.myParticipation} />
      {:else if $message.invitationMessage == InvitationMessage.ParticipantReply }
        <vbox class="participant-reply">
          {$t`${$message.from.name} has responded to your invitation.`}
          <hbox class="status font-large">
            {#if participant}
              <ParticipantConfirmIcon {participant} size={24} />
              <ParticipantConfirmText {participant} />
            {/if}
          </hbox>
        </vbox>
      {:else if $message.invitationMessage == InvitationMessage.CancelledEvent }
        <hbox class="cancelled-text">
          {$t`This meeting has been cancelled by the organizer`}
        </hbox>
      {/if}

      {#if ($message.invitationMessage == InvitationMessage.ParticipantReply || $message.invitationMessage == InvitationMessage.CancelledEvent) && incomingInvitation}
        {#await event && onUpdate()}
          <!-- Update processing -->
        {:then}
          <!-- Update processed -->
        {:catch ex}
          <ErrorMessageInline {ex} />
        {/await}
      {/if}
    </hbox>
  </vbox>
  {#if $message.event && width > 600}
    <EventInDayView event={$message.event} />
  {/if}
</hbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Event } from "../../../logic/Calendar/Event";
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import type { IncomingInvitation } from "../../../logic/Calendar/Invitation/IncomingInvitation";
  import { InvitationMessage } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import InvitationDisplay from "./InvitationDisplay.svelte";
  import InvitationButtons from "./InvitationButtons.svelte";
  import EventInDayView from "./EventInDayView.svelte";
  import ParticipantConfirmIcon from "../EditEvent/ParticipantConfirmIcon.svelte";
  import ParticipantConfirmText from "../EditEvent/ParticipantConfirmText.svelte";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import AccountIcon from "lucide-svelte/icons/book-user";
  import { t } from "../../../l10n/l10n";
  import type { Collection } from "svelte-collections";

  export let message: EMail;
  let calendars: Collection<Calendar>;
  let selectedCalendar: Calendar | undefined; // undefined, because `null` means "All accounts" for `<AccountDropDown>`
  let incomingInvitation: IncomingInvitation;
  let event: Event | undefined;
  let width: number;

  $: if (message.event) {
    loadCalendars();
  }

  async function loadEvent(message: EMail) {
    event = undefined;
    await message.loadEvent();
    await loadCalendars();
  }
  async function loadCalendars() {
    calendars = message.getUpdateCalendars();
    selectedCalendar = calendars.find(calendar => calendar.events.some(event => event.calUID == message.event.calUID))
      ?? calendars.first;
    if (selectedCalendar) {
      await selectCalendar(selectedCalendar);
    }
  }
  async function selectCalendar(calendar: Calendar) {
    if (event && !selectedCalendar.events.some(event => event.calUID == message.event.calUID)) {
      await event.moveToCalendar(selectedCalendar);
    }
    incomingInvitation = selectedCalendar.getIncomingInvitationForEMail(message);
    event = incomingInvitation.calEvent();
  }

  async function onUpdate() {
    let foundEventInCalendars = message.getUpdateCalendars();
    for (let calendar of foundEventInCalendars) {
      let incomingInvitation = calendar.getIncomingInvitationForEMail(message);
      await incomingInvitation.updateFromOtherInvitationMessage();
    }
  }

  $: participant = $message.event?.participants.find(p => p.matches($message.from));
</script>

<style>
  .appointment {
    padding: 24px 32px;
    flex: 2 0 0;
  }
  .buttons {
    align-items: center;
    justify-content: center;
    margin-block-start: 16px;
  }
  .cancelled-text {
    flex-wrap: wrap;
    background-color: rgba(255, 166, 0, 0.291);
    padding: 8px 12px;
    border-radius: 3px;
    margin: 8px;
  }
  .calendar-selector {
    margin-inline-start: 12px;
  }
  .calendar-selector :global(select) {
    margin-inline-start: 8px;
  }
  .participant-reply .status {
    align-items: center;
    margin-block-start: 4px;
  }
  .participant-reply .status :global(.participant-status-text) {
    padding: 0;
    padding-inline-start: 8px;
    font-size: inherit;
    font-weight: 500;
  }
  .participant-reply .status :global(.participant-status-icon) {
    font-size: inherit;
  }
</style>
