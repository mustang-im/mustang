<vbox class="show-event">
  <DialogHeader {event} />
  <vbox class="content" flex>
    <InvitationDisplay {event} selectedCalendar={event.calendar} {calendars} />

    {#if $event.isCancelled }
      <hbox class="cancelled-text">
        {$t`This meeting has been cancelled by the organizer. You may delete it.`}
      </hbox>
    {:else}
      <InvitationButtons invitation={event} myParticipation={$event.myParticipation} />
    {/if}
  </vbox>
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
  .show-event {
    container-type: inline-size;
  }
  .content {
    padding: 24px 32px;
  }
  .cancelled-text {
    flex-wrap: wrap;
    background-color: rgba(255, 98, 0, 0.443);
    padding: 8px 12px;
    border-radius: 3px;
    margin: 8px;
  }
</style>
