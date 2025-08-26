<vbox flex class="list-view">
  <FastList items={events}
    columns="5em 3.5em 1fr">
    <ListViewLine {event} slot="row" let:item={event} />
  </FastList>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import ListViewLine from "./ListViewLine.svelte";
  import FastList from "../../Shared/FastList.svelte";
  import type { Collection } from "svelte-collections";

  export let events: Collection<Event>;
</script>

<style>
  .list-view {
    margin-inline-start: 12px;
    max-width: 30em;
  }
  .list-view :global(.time) {
    color: var(--fg);
  }
  .list-view :global(.title) {
    padding-inline-start: 12px;
  }
</style>
