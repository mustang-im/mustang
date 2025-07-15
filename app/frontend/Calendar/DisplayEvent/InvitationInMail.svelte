<vbox class="invitation">
  {#if $message.event}
    <InvitationDisplay event={$message.event} {calendars} bind:selectedCalendar on:select={selectCalendar} />
  {:else if $message.invitationMessage}
    {#await loadEvent(message)}
      {$t`Loading event...`}
    {:then}
      {#if $message.event}
        <InvitationDisplay event={$message.event} {calendars} bind:selectedCalendar on:select={selectCalendar} />
      {:else}
        {$t`No event found`}
      {/if}
    {:catch ex}
      {ex?.message ?? ex}
    {/await}
  {/if}
  <hbox class="buttons">
    {#if $message.invitationMessage == InvitationMessage.Invitation && incomingInvitation}
      <InvitationButtons {incomingInvitation} myParticipation={incomingInvitation.myParticipation} />
    {:else if $message.invitationMessage == InvitationMessage.CancelledEvent }
      <hbox class="cancelled-text">
        {$t`This meeting has been cancelled by the organizer`}
      </hbox>
    {/if}

    {#if ($message.invitationMessage == InvitationMessage.ParticipantReply || $message.invitationMessage == InvitationMessage.CancelledEvent) && incomingInvitation}
      {#await onUpdate()}
        <!-- Update processing -->
      {:then}
        <!-- Update processed -->
      {:catch ex}
        <ErrorMessageInline {ex} />
      {/await}
    {/if}
  </hbox>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Event } from "../../../logic/Calendar/Event";
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import type { IncomingInvitation } from "../../../logic/Calendar/Invitation/IncomingInvitation";
  import { InvitationMessage } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import InvitationDisplay from "./InvitationDisplay.svelte";
  import InvitationButtons from "./InvitationButtons.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import type { Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;
  let calendars: Collection<Calendar>;
  let selectedCalendar: Calendar | undefined; // undefined, because `null` means "All accounts" for `<AccountDropDown>`
  let incomingInvitation: IncomingInvitation;
  let event: Event | undefined;

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
      await selectCalendar();
    }
  }
  async function selectCalendar() {
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
</script>

<style>
  .invitation {
    padding: 24px 32px;
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
</style>
