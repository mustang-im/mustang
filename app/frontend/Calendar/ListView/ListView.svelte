<hbox class="range-header">
  <slot name="top-left" />
  <hbox flex />
  <slot name="top-right" />
</hbox>

{#if $globalSearchTerm}
  <vbox class="search">
    <hbox>
      <SearchField bind:searchTerm={$globalSearchTerm} />
    </hbox>
    <hbox class="result-count font-normal">{$t`Found ${filteredEvents.length} events`}</hbox>
  </vbox>
{/if}

<vbox flex class="list-view">
  <FastList items={filteredEvents}
    columns="5em 3.5em 1fr">
    <ListViewLine {event} slot="row" let:item={event} />
  </FastList>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import ListViewLine from "./ListViewLine.svelte";
  import FastList from "../../Shared/FastList.svelte";
  import SearchField from "../../Shared/SearchField.svelte";
  import type { Collection } from "svelte-collections";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import { t } from "../../../l10n/l10n";

  export let events: Collection<Event>;

  $: filteredEvents = $globalSearchTerm
    ? events.filterObservable(ev => ev.startTime.getTime() > Date.now() &&
      (ev.title?.toLowerCase().includes($globalSearchTerm) ||
       ev.descriptionText?.toLowerCase().includes($globalSearchTerm)))
    : events.filterObservable(ev => ev.startTime.getTime() > Date.now());
</script>

<style>
  .search {
    margin-block-start: 24px;
    margin-block-end: 18px;
    margin-inline-start: 12px;
  }
  .result-count {
    margin-block-start: 8px;
    margin-inline-start: 4px;
    opacity: 80%;
  }
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
