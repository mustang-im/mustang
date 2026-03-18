{#if $event.isIncomingMeeting}
  <InvitationInCalendar {event} />
{:else if $event.unedited} <!-- is in edit mode -->
  <EditEvent {event} />
{:else}
  <DisplayEvent {event} />
{/if}

{#if appGlobal.isMobile}
  <ShowEventBarM />
{/if}

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { appGlobal } from "../../../logic/app";
  import EditEvent from "../EditEvent/EditEvent.svelte";
  import DisplayEvent from "./DisplayEvent.svelte";
  import InvitationInCalendar from "./InvitationInCalendar.svelte";
  import ShowEventBarM from "./ShowEventBarM.svelte";

  export let event: Event;
</script>
