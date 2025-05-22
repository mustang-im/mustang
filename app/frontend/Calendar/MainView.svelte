{#if dateInterval == 0 || $globalSearchTerm}
  <ListView {events}>
    <slot name="top-left" slot="top-left" />
    <slot name="top-right" slot="top-right" />
  </ListView>
{:else if dateInterval == 1}
  <WeekView bind:start {events} showDays={1}>
    <slot name="top-left" slot="top-left" />
    <slot name="top-right" slot="top-right" />
  </WeekView>
{:else if dateInterval == 7}
  <WeekView bind:start {events}>
    <slot name="top-left" slot="top-left" />
    <slot name="top-right" slot="top-right" />
  </WeekView>
{:else if dateInterval == 28}
  <MonthView bind:start {events} showDays={28}>
    <slot name="top-left" slot="top-left" />
    <slot name="top-right" slot="top-right" />
  </MonthView>
{:else if dateInterval == 31}
  <MonthView bind:start {events}>
    <slot name="top-left" slot="top-left" />
    <slot name="top-right" slot="top-right" />
  </MonthView>
{:else if dateInterval == 2}
  <DualView bind:start {events}>
    <slot name="top-left" slot="top-left" />
    <slot name="top-right" slot="top-right" />
  </DualView>
{:else}
  <WeekView bind:start {events}>
    <slot name="top-left" slot="top-left" />
    <slot name="top-right" slot="top-right" />
  </WeekView>
{/if}

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import type { DateInterval } from "./selected";
  import { globalSearchTerm } from "../AppsBar/selectedApp";
  import WeekView from "./DayView/WeekView.svelte";
  import MonthView from "./MonthView/MonthView.svelte";
  import DualView from "./DualView.svelte";
  import ListView from "./ListView/ListView.svelte";
  import type { Collection } from "svelte-collections";

  export let start: Date;
  export let events: Collection<Event>;
  export let dateInterval: DateInterval;
</script>
