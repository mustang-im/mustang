<grid class="event-display-grid" flex>
  {#if $event.startTime}
    <ClockIcon size="16px" />
    <TimeDisplay {event} />
  {/if}

  {#if $participants?.hasItems}
    <ParticipantsIcon size="16px" />
    <ParticipantsDisplay {event} />
  {/if}

  {#if event.location}
    <LocationIcon size="16px" />
    <hbox class="location font-normal">
      {$event.location}
    </hbox>
  {/if}

  {#if $event.isOnline && $event.onlineMeetingURL}
    <OnlineMeetingIcon size="16px" />
    <OnlineMeetingDisplay {event} />
  {/if}
</grid>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import ClockIcon from "lucide-svelte/icons/clock-8";
  import LocationIcon from "lucide-svelte/icons/map-pin";
  import OnlineMeetingIcon from "lucide-svelte/icons/video";
  import ParticipantsIcon from "lucide-svelte/icons/users-round";
  import TimeDisplay from "./TimeDisplay.svelte";
  import OnlineMeetingDisplay from "./OnlineMeetingDisplay.svelte";
  import ParticipantsDisplay from "./ParticipantsDisplay.svelte";

  export let event: Event;

  $: participants = event.participants;
</script>

<style>
  grid.event-display-grid {
    grid-template-columns: max-content max-content;
    justify-items: start;
    align-items: center;
    gap: 16px;
  }
  .location {
    flex-wrap: wrap;
  }
</style>
