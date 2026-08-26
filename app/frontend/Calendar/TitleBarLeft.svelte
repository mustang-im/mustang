<hbox class="title-bar">
  {#if !$isCalendarListOpen}
    <ShowCalendarsButton />
  {/if}
  <NewEventButton />
</hbox>

<script lang="ts">
  import { isCalendarListOpen } from "./selected";
  import ShowCalendarsButton from "./ShowCalendarsButton.svelte";
  import NewEventButton from "./NewEventButton.svelte";
</script>

<style>
  .title-bar {
    align-items: center;
    justify-content: center;
    margin: 4px;
  }
</style>
