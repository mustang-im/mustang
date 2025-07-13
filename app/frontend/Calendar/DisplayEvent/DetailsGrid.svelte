<grid class="event-display-grid" flex>
  {#if $event.startTime}
    <ClockIcon size="16px" />
    <TimeDisplay {event} />
  {/if}

  {#if $event.recurrenceCase == RecurrenceCase.Master}
    <hbox />
    <hbox class="recurrence">{ruleAsLabel($event.recurrenceRule, $event.startTime)}</hbox>
  {/if}

  {#if $participants?.hasItems}
    <ParticipantsIcon size="16px" />
    <ParticipantsDisplay {event} />
  {/if}

  {#if event.location}
    <LocationIcon size="16px" />
    <value class="location font-normal">
      {$event.location}
    </value>
  {/if}

  {#if $event.isOnline && $event.onlineMeetingURL}
    <OnlineMeetingIcon size="16px" />
    <OnlineMeetingDisplay {event} />
  {/if}
</grid>

<script lang="ts">
  import { RecurrenceCase, type Event } from "../../../logic/Calendar/Event";
  import { ruleAsLabel } from "../../../logic/Calendar/RecurrenceRule";
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
    grid-template-columns: max-content 1fr;
    justify-items: start;
    align-items: start;
    gap: 16px;
    max-width: 100%;
  }
  grid.event-display-grid :global(> svg) {
    margin-block-start: 4px;
  }
  .recurrence {
    font-weight: 600;
  }
  .recurrence,
  .location {
    flex-wrap: wrap;
    max-width: 100%;
}
</style>
