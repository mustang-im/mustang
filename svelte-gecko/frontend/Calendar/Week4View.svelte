<vbox class="week-4-view">
  4 week view
</vbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import type { Collection } from "svelte-collections";
  
  export let start: Date;
  export let events: Collection<Event>;
</script>

<style>
  .week-4-view {
    flex: 1 0 0;
  }
</style>
