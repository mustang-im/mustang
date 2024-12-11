<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<hbox flex class="dual-view">
  <WeekView bind:start {events} showDays={2}>
    <slot name="top-left" slot="top-left" />
  </WeekView>
  <MonthView start={monthStart} {events} showDays={35}>
    <slot name="top-right" slot="top-right" />
  </MonthView>
</hbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import type { Collection } from "svelte-collections";
  import WeekView from "./WeekView.svelte";
  import MonthView from "./MonthView.svelte";

  export let start: Date;
  export let events: Collection<Event>;

  let monthStart: Date;

  $: start, syncMonth();
  function syncMonth() {
    monthStart = start;
  }
</script>

<style>
</style>
