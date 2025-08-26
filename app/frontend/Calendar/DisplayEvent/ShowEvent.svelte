{#if event.isIncomingMeeting}
  <InvitationInCalendar {event} />
{:else}
  <EditEvent {event} />
{/if}

{#if appGlobal.isMobile}
  <ShowEventBarM />
{/if}

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { appGlobal } from "../../../logic/app";
  import EditEvent from "../EditEvent/EditEvent.svelte";
  import InvitationInCalendar from "./InvitationInCalendar.svelte";
  import ShowEventBarM from "./ShowEventBarM.svelte";

  export let event: Event;
</script>
