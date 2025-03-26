<vbox class="invitation">
  {#if $message.event}
    <InvitationDisplay event={message.event} />
  {:else if message.scheduling}
    {#await message.loadEvent()}
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
  {#if message.scheduling == Scheduling.Request}
    <hbox class="buttons">
      <Button
        label={$t`Confirm *=> Confirm to attend the meeting`}
        onClick={onAccept}
        icon={AcceptIcon}
        classes="accept" />
      <Button
        label={$t`Reject *=> Decline to attend the meeting`}
        onClick={onDecline}
        icon={DeclineIcon}
        classes="decline secondary" />
      <ButtonMenu buttonIcon={ChevronDownIcon}>
        <MenuItem
          label={$t`Maybe *=> Maybe attend the meeting`}
          onClick={onTentative}
          icon={MaybeIcon}
          classes="maybe" />
      </ButtonMenu>
    </hbox>
  {:else if message.scheduling == Scheduling.Accepted}
    <hbox class="buttons">
      <Button
        label={$t`Confirmed *=> A meeting request has been confirmed by you`}
        icon={AcceptIcon}
        selected={true}
        disabled={true}
        classes="accept done" />
      <ButtonMenu buttonIcon={ChevronDownIcon}>
        <MenuItem
          label={$t`Change to Reject *=> not attend the meeting`}
          onClick={onDecline}
          icon={DeclineIcon}
          classes="decline" />
        <MenuItem
          label={$t`Change to Maybe *=> Maybe attend the meeting`}
          onClick={onTentative}
          icon={MaybeIcon}
          classes="maybe" />
      </ButtonMenu>
    </hbox>
  {:else if message.scheduling == Scheduling.Declined}
    <hbox class="buttons">
      <Button
        label={$t`Rejected *=> A meeting request has been declined by you`}
        icon={DeclineIcon}
        selected={true}
        disabled={true}
        classes="decline done" />
      <ButtonMenu buttonIcon={ChevronDownIcon}>
        <MenuItem
          label={$t`Change to Accept *=> attend the meeting`}
          onClick={onAccept}
          icon={AcceptIcon}
          classes="accept" />
        <MenuItem
          label={$t`Change to Maybe *=> Maybe attend the meeting`}
          onClick={onTentative}
          icon={MaybeIcon}
          classes="maybe" />
      </ButtonMenu>
    </hbox>
  {/if}
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { Scheduling, ResponseType, type Responses } from "../../../logic/Calendar/Invitation";
  import InvitationDisplay from "./InvitationDisplay.svelte";
  import Button from "../../Shared/Button.svelte";
  import AcceptIcon from "lucide-svelte/icons/check-check";
  import DeclineIcon from "lucide-svelte/icons/x";
  import MaybeIcon from "lucide-svelte/icons/circle-help";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
  import { t } from "../../../l10n/l10n";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";

  export let message: EMail;

  async function respond(response: Responses) {
    await message.respondToInvitation(response);
  }
  async function onAccept() {
    await respond(ResponseType.Accept);
  }
  async function onTentative() {
    await respond(ResponseType.Tentative);
  }
  async function onDecline() {
    await respond(ResponseType.Decline);
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
    font-size: 15px;
  }
  .buttons :global(button.menu-button) {
    margin-inline-start: 4px;
    font-size: 15px;
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
