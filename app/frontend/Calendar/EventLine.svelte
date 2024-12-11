<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="event" on:click on:click={onSelect} on:dblclick={onOpen}
  title={eventAsText}
  class:selected={$selectedEvent == event}>
  <!--{event.startTime.toLocaleTimeString(getUILocale(), { hour: "numeric", minute: "numeric" })}-->
  <hbox class="time">{startTime}</hbox>
  <hbox class="title">{event.title}</hbox>
</hbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import { calendarMustangApp } from "./CalendarMustangApp";
  import { selectedEvent } from "./selected";
  import { getUILocale, t } from "../../l10n/l10n";

  export let event: Event;

  $: startTime = event.startTime.toLocaleString(getUILocale(), { hour: "2-digit", minute: "2-digit" });
  $: eventAsText = `${startTime} – ${$t`${Math.ceil((event.endTime.getTime() - event.startTime.getTime()) / 1000 / 60)} min`}
${event.title}
${event.participants.hasItems ? event.participants.getIndexRange(0, 4).map(person => person.name).join(", "): ""}`;

  function onSelect() {
    $selectedEvent = event;
  }

  function onOpen() {
    $selectedEvent = event;
    calendarMustangApp.editEvent(event);
  }
</script>

<style>
  .event {
    margin-block-end: 1px;
    padding: 4px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-height: 1.4em;
    font-size: 13px;

    background-color: #20AF9E50;
    color: black;
  }
  .event:hover {
    background-color: #20AF9E70;
  }
  .time {
    margin-inline-end: 4px;
    font-weight: 600;
  }

  @media (prefers-color-scheme: dark) {
    .event {
      background-color: #ff7c0e;
      color: black;
    }
  }
</style>
