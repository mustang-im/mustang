<vbox class="month-view">
  Month view
</vbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import type { Collection } from "svelte-collections";
  
  export let start: Date;
  export let events: Collection<Event>;
</script>

<style>
  .month-view {
    flex: 1 0 0;
  }
</style>
