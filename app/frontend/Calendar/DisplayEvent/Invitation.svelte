<vbox class="invitation">
  {#if $message.event}
    <InvitationDisplay event={message.event} {calendars} bind:selectedCalendar on:select={selectCalendar} />
  {:else if $message.invitationMessage}
    {#await loadEvent()}
      {$t`Loading event...`}
    {:then}
      {#if $message.event}
        <InvitationDisplay event={$message.event} {calendars} bind:selectedCalendar on:select={selectCalendar} />
      {:else}
        No event found
      {/if}
    {:catch ex}
      {ex?.message ?? ex}
    {/await}
  {/if}
  <hbox class="buttons">
    {#if $message.invitationMessage == InvitationMessage.Invitation && incomingInvitation}
      {#if myParticipation == InvitationResponse.Organizer}
        {$t`You sent this invitation`}
      {:else if myParticipation == InvitationResponse.Accept}
        <Button
          label={$t`Confirmed *=> A meeting request has been confirmed by you`}
          icon={AcceptIcon}
          selected={true}
          disabled={true}
          classes="accept done font-normal" />
        <ButtonMenu buttonIcon={ChevronDownIcon}>
          <MenuItem
            label={$t`Change to Reject *=> not attend the meeting`}
            onClick={onDecline}
            icon={DeclineIcon}
            classes="decline font-normal" />
          <MenuItem
            label={$t`Change to Maybe *=> Maybe attend the meeting`}
            onClick={onTentative}
            icon={MaybeIcon}
            classes="maybe font-normal" />
        </ButtonMenu>
      {:else if myParticipation == InvitationResponse.Decline}
        <Button
          label={$t`Rejected *=> A meeting request has been declined by you`}
          icon={DeclineIcon}
          selected={true}
          disabled={true}
          classes="decline done font-normal" />
        <ButtonMenu buttonIcon={ChevronDownIcon}>
          <MenuItem
            label={$t`Change to Accept *=> attend the meeting`}
            onClick={onAccept}
            icon={AcceptIcon}
            classes="accept font-normal" />
          <MenuItem
            label={$t`Change to Maybe *=> Maybe attend the meeting`}
            onClick={onTentative}
            icon={MaybeIcon}
            classes="maybe font-normal" />
        </ButtonMenu>
      {:else}
        <Button
          label={$t`Confirm *=> Confirm to attend the meeting`}
          onClick={onAccept}
          icon={AcceptIcon}
          classes="accept font-normal" />
        <Button
          label={$t`Reject *=> Decline to attend the meeting`}
          onClick={onDecline}
          icon={DeclineIcon}
          classes="decline secondary font-normal" />
        <ButtonMenu buttonIcon={ChevronDownIcon}>
          <MenuItem
            label={$t`Maybe *=> Maybe attend the meeting`}
            onClick={onTentative}
            icon={MaybeIcon}
            classes="maybe font-normal" />
        </ButtonMenu>
      {/if}
    {:else if ($message.invitationMessage == InvitationMessage.ParticipantReply || $message.invitationMessage == InvitationMessage.CancelledEvent) && incomingInvitation}
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
  import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import InvitationDisplay from "./InvitationDisplay.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import Button from "../../Shared/Button.svelte";
  import AcceptIcon from "lucide-svelte/icons/check-check";
  import DeclineIcon from "lucide-svelte/icons/x";
  import MaybeIcon from "lucide-svelte/icons/circle-help";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
  import { gt, t } from "../../../l10n/l10n";
  import type { Collection } from "svelte-collections";

  export let message: EMail;
  let calendars: Collection<Calendar>;
  let selectedCalendar: Calendar | undefined;
  let myParticipation: InvitationResponse = InvitationResponse.NoResponseReceived;
  let incomingInvitation: IncomingInvitation;
  let event: Event | undefined;

  $: if (message.event) {
    loadCalendars();
  }

  async function loadEvent() {
    await message.loadEvent();
    await loadCalendars();
  }
  async function loadCalendars() {
    calendars = message.getUpdateCalendars();
    selectedCalendar = calendars.find(calendar => calendar.events.some(event => event.calUID == message.event.calUID)) || calendars.first;
    if (selectedCalendar) {
      await selectCalendar();
    }
  }
  async function selectCalendar() {
    if (event && !selectedCalendar.events.some(event => event.calUID == message.event.calUID)) {
      await event.moveToCalendar(selectedCalendar);
    }
    event = selectedCalendar.events.find(event => event.calUID == message.event.calUID);
    incomingInvitation = selectedCalendar.getIncomingInvitationFor(message);
    myParticipation = incomingInvitation.myParticipation;
  }

  async function respond(response: InvitationResponseInMessage) {
    await incomingInvitation.respondToInvitation(response);
    myParticipation = response;
    event ??= selectedCalendar.events.find(event => event.calUID == message.event.calUID);
  }
  async function onAccept() {
    await respond(InvitationResponse.Accept);
  }
  async function onTentative() {
    await respond(InvitationResponse.Tentative);
  }
  async function onDecline() {
    await respond(InvitationResponse.Decline);
  }
  async function onUpdate() {
    let foundEventInCalendars = message.getUpdateCalendars();
    for (let calendar of foundEventInCalendars) {
      let incomingInvitation = calendar.getIncomingInvitationFor(message);
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
  .buttons > :global(button) {
    margin-inline-start: 12px;
  }
  .buttons :global(button.menu-button) {
    margin-inline-start: 4px;
  }
  .buttons :global(button .label) {
    margin-inline-end: 6px;
  }
  .buttons > :global(button.accept) {
    color: #1B8022;
    background-color: #AAE3D2;
  }
  .buttons :global(button.accept) {
    color: #1B8022;
  }
  .buttons :global(button.decline) {
    color: #FE1B1B;
    border-color: #F69FA1;
  }
  .buttons :global(button.accept.done) {
    color: white;
    background-color: #36957A;
    opacity: 100%;
  }
  .buttons :global(button.decline.done) {
    color: white;
    background-color: #A86F69;
    opacity: 100%;
  }
</style>
