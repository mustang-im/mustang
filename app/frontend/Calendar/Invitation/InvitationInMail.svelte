<hbox class="invitation" bind:offsetWidth={width}>
  <vbox class="appointment">
    {#if $message.event}
      <InvitationDisplay event={$message.event} />
    <!-- Can be removed. Only for old messages that didn't save email.event to DB as JSON. -->
    {:else if $message.invitationMessage}
      {#await message.loadEvent()}
        {$t`Loading event...`}
      {:then}
        {#if !$message.event}
          {$t`No event found`}
        {/if}
      {:catch ex}
        {ex?.message ?? ex}
      {/await}
    {/if}
    {#if $message.invitationMessage == InvitationMessage.Invitation}
      <IncomingInvitationInMail {message} />
    {:else if $message.invitationMessage == InvitationMessage.CancelledEvent }
      <InvitationCancellationInMail />
    {:else if message.invitationMessage == InvitationMessage.ParticipantReply}
      <InvitationResponseInMail {message} />
    {/if}
  </vbox>
  {#if $message.event && width > 600}
    <EventInDayView event={$message.event} />
  {/if}
</hbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { InvitationMessage } from "../../../logic/Calendar/Invitation/InvitationStatus";
  import InvitationDisplay from "./InvitationDisplay.svelte";
  import IncomingInvitationInMail from "./IncomingInvitationInMail.svelte";
  import InvitationResponseInMail from "./InvitationResponseInMail.svelte";
  import InvitationCancellationInMail from "./InvitationCancellationInMail.svelte";
  import EventInDayView from "../DisplayEvent/EventInDayView.svelte";
  import { t } from "../../../l10n/l10n";

  export let message: EMail;
  let width: number;

  $: console.log(message.subject, message.event, "invitationMessage", message.invitationMessage, "invitation");
</script>

<style>
  .appointment {
    padding: 24px 32px;
    flex: 2 0 0;
  }
</style>
