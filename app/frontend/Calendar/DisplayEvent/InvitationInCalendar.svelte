<DialogHeader {event} />
<vbox class="content" flex>
  <InvitationDisplay {event} selectedCalendar={event.calendar} {calendars} />

  {#if event.isCancelled }
    {$t`This event has been cancelled by the organizer`}
  {:else}
    <InvitationButtons incomingInvitation={event} myParticipation={event.myParticipation} />
  {/if}
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import InvitationDisplay from "./InvitationDisplay.svelte";
  import InvitationButtons from "./InvitationButtons.svelte";
  import DialogHeader from "./DialogHeader.svelte";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let event: Event;

$: calendars = new ArrayColl([event.calendar]);
</script>

<style>
  .content {
    padding: 24px 32px;
  }
</style>
