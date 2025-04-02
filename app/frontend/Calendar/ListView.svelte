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
    <hbox class="result-count">{$t`Found ${filteredEvents.length} events`}</hbox>
  </vbox>
{/if}

<vbox flex class="list-view">
  <FastList items={filteredEvents}
    columns="auto 1fr">
    <EventLine slot="row" let:item event={item} />
  </FastList>
</vbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import EventLine from "./MonthView/EventLine.svelte";
  import FastList from "../Shared/FastList.svelte";
  import SearchField from "../Shared/SearchField.svelte";
  import type { Collection } from "svelte-collections";
  import { globalSearchTerm } from "../AppsBar/selectedApp";
  import { t } from "../../l10n/l10n";

  export let events: Collection<Event>;

  $: filteredEvents = globalSearchTerm
    ? events.filter(ev => ev.title?.toLowerCase().includes($globalSearchTerm) ||
      ev.descriptionText?.toLowerCase().includes($globalSearchTerm))
    : events;
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
    font-size: 15px;
    opacity: 80%;
  }
  .list-view {
    margin-inline-start: 12px;
  }
  .list-view :global(.event) {
    display: contents;
  }
  .list-view :global(.title) {
    margin-inline-start: 12px;
  }
</style>
