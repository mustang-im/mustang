{#if $meetings.length > 1}
  <grid>
    {#each $meetings.each as meeting}
      <hbox>{meeting.startTime.toLocaleTimeString(getDateTimeFormatPref())} - {meeting.endTime.toLocaleTimeString(getDateTimeFormatPref())}</hbox>
      <hbox>{meeting.title}</hbox>
    {/each}
  </grid>
{:else}
  <slot name="emptyMsg" />
{/if}

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { Collection } from "svelte-collections";
  import { getDateTimeFormatPref } from "../../../l10n/l10n";

  export let meetings: Collection<Event>;
</script>

<style>
  grid {
    grid-template-columns: auto 1fr;
  }
</style>
