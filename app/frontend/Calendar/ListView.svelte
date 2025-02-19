<hbox class="range-header">
  <slot name="top-left" />
  <hbox flex />
  <slot name="top-right" />
</hbox>
<vbox flex class="list-view">
  <FastList items={filteredEvents}
    columns="auto 1fr">
    <svelte:fragment slot="header">
      <hbox class="time">{$t`Time`}</hbox>
      <hbox>{$t`Title`}</hbox>
    </svelte:fragment>
    <EventLine slot="row" let:item event={item} />
  </FastList>
</vbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import EventLine from "./MonthView/EventLine.svelte";
  import FastList from "../Shared/FastList.svelte";
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
  .list-view :global(.event) {
    display: contents;
  }
</style>
