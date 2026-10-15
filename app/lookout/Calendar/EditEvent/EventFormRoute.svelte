{#if event}
  {#key event}
    <EventFormPage {event} />
  {/key}
{/if}

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { selectedEvent } from "../../../frontend/Calendar/selected";
  import { getParams } from "../../../frontend/AppsBar/selectedApp";
  import EventFormPage from "./EventFormPage.svelte";
  import { useLocation } from "svelte-navigator";

  const location = useLocation();
  $: params = getParams($location?.state);
  $: event = params?.event as Event;
  $: event && selectedEvent.set(event);
</script>
