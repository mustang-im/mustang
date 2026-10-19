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
    <hbox class="result-count font-normal">
      {$t`Found ${filteredEvents.length} events`}
    </hbox>
  </vbox>
{/if}

<ListView events={filteredEvents} />

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import ListView from "./ListView.svelte";
  import SearchField from "../../Shared/SearchField.svelte";
  import { ArrayColl, type Collection } from "svelte-collections";
  import { derived } from "svelte/store";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import { t } from "../../../l10n/l10n";

  export let events: Collection<Event>;

  $: futureEvents = derived([...$events.contents], allEvents =>
    allEvents.filter(event => event.startTime.getTime() > Date.now()));
  $: filteredEvents = new ArrayColl($globalSearchTerm
    ? $futureEvents.filter(event => event.matchesSearch($globalSearchTerm))
    : $futureEvents);
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
</style>
