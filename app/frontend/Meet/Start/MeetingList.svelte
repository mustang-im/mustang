{#if $meetings.hasItems}
  <Scroll>
    <grid>
      {#each $meetings.each as meeting}
        <hbox class="time">{getDateTimeString(meeting.startTime)}</hbox>
        <hbox class="title">{meeting.title}</hbox>
      {/each}
    </grid>
  </Scroll>
{:else}
  <slot name="emptyMsg" />
{/if}

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import Scroll from "../../Shared/Scroll.svelte";
  import { getDateTimeString } from "../../Util/date";
  import type { Collection } from "svelte-collections";

  export let meetings: Collection<Event>;
</script>

<style>
  grid {
    grid-template-columns: auto 1fr;
  }
  .time {
    margin-inline-end: 12px;
  }
</style>
