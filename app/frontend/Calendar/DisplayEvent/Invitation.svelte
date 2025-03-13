<vbox class="invitation">
  {#if $message.event}
    <InvitationDisplay event={message.event} />
  {:else if message.invitationMessage}
    {#await loadEvent()}
      {$t`Loading event...`}
    {:then}
      {#if message.event}
        <InvitationDisplay event={message.event} />
      {:else}
        No event found
      {/if}
    {:catch ex}
      {ex?.message ?? ex}
    {/await}
  {/if}
  <hbox class="buttons">
    {#if selectedCalendar}
      <AccountDropDown selectedAccount={selectedCalendar} accounts={calendars} withIcon={true} withLabel={true} disabled={calendars.length < 2} />
    {/if}
    {#if message.invitationMessage == InvitationMessage.Invitation}
      <Button
        label={$t`Confirm *=> Confirm to attend the meeting`}
        onClick={onAccept}
        icon={AcceptIcon}
        classes="accept font-normal" />
      <Button
        label={$t`Maybe *=> Maybe attend the meeting`}
        onClick={onTentative}
        icon={MaybeIcon}
        classes="maybe secondary font-normal" />
      <Button
        label={$t`Reject *=> Decline to attend the meeting`}
        onClick={onDecline}
        icon={DeclineIcon}
        classes="decline secondary font-normal" />
    {:else if message.invitationMessage}
      <Button label={$t`Update calendar`} disabled={updateDisabled} onClick={onUpdate} classes="font-normal" />
    {/if}
  </hbox>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import InvitationDisplay from "./InvitationDisplay.svelte";
  import AccountDropDown from "../../Shared/AccountDropDown.svelte";
  import Button from "../../Shared/Button.svelte";
  import AcceptIcon from "lucide-svelte/icons/check-check";
  import DeclineIcon from "lucide-svelte/icons/x";
  import MaybeIcon from "lucide-svelte/icons/circle-help";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
  import { gt, t } from "../../../l10n/l10n";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";

  export let message: EMail;
  let calendars: Collection<Calendar>;
  let selectedCalendar: Calendar | undefined;
  let updateDisabled: boolean | string = false;

  $: if (message.event) {
    loadCalendars();
  }

  async function loadEvent() {
    await message.loadEvent();
    loadCalendars();
  }
  function loadCalendars() {
    calendars = message.getUpdateCalendars();
    selectedCalendar = calendars.first;
    updateDisabled = calendars.length ? false : gt`This event is not in your calendar`;
  }

  async function respond(response: InvitationResponseInMessage) {
    await selectedCalendar.respondToInvitation(message, response);
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
    await selectedCalendar.updateFromResponse(message.invitationMessage, message.event);
    updateDisabled = gt`This update has already been processed`;
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
