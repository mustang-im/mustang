<vbox class="search-page" flex>
  <ListView events={filteredEvents} />

  {#if $globalSearchTerm}
    <hbox class="result-count font-normal">
      {$t`Found ${filteredEvents.length} events`}
    </hbox>
  {/if}

  <SearchField bind:searchTerm={$globalSearchTerm} placeholder={$t`Search for an appointment`} autofocus />
</vbox>
<SearchBarM />

<script lang="ts">
  import { appGlobal } from "../../../logic/app";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import ListView from "./ListView.svelte";
  import SearchField from "../../Shared/SearchField.svelte";
  import SearchBarM from "./SearchBarM.svelte";
  import { t } from "../../../l10n/l10n";
  import { ArrayColl } from "svelte-collections";
  import { derived } from "svelte/store";

  export let searchTerm: string;

  $: searchTerm && setSearchTerm()
  function setSearchTerm() {
    $globalSearchTerm = searchTerm;
  }

  let calendarEvents = appGlobal.calendarEvents;
  $: events = derived([...$calendarEvents.contents], allEvents =>
    allEvents.filter(event => event.startTime.getTime() > Date.now()));
  $: filteredEvents = new ArrayColl($globalSearchTerm
    ? $events.filter(event => event.matchesSearch($globalSearchTerm))
    : $events);
</script>

<style>
  .search-page {
    padding: 16px 16px 8px 16px;
  }
  .result-count {
    margin: 8px;
  }
</style>
