{#if event.isIncomingMeeting}
  <InvitationInCalendar {event} />
{:else}
  <EditEvent {event} />
{/if}

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import EditEvent from "../EditEvent/EditEvent.svelte";
  import InvitationInCalendar from "./InvitationInCalendar.svelte";

  export let event: Event;
</script>
