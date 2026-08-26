<vbox class="calendar-list">
  <hbox class="header">
    <ShowCalendarsButton />
  </hbox>
  <vbox class="calendars" flex>
    {#each $calendars.each as calendar (calendar.id)}
      <hbox class="calendar" style="--calendar-color: {calendar.color}">
        <Checkbox
          toggle={true}
          checked={$shownCalendars.contains(calendar)}
          tooltip={$t`Show this calendar`}
          on:change={event => shownCalendars.show(calendar, event.detail)}
          />
        <hbox class="name" flex>{calendar.name}</hbox>
        <RoundButton
          label={$t`New event in ${calendar.name}`}
          icon={AddIcon}
          classes="small"
          border={false}
          onClick={() => createNewEvent(calendar, $selectedDate, false)}
          />
      </hbox>
    {/each}
  </vbox>
</vbox>

<script lang="ts">
  import { selectedDate, shownCalendars } from "./selected";
  import { createNewEvent } from "./event";
  import { appGlobal } from "../../logic/app";
  import ShowCalendarsButton from "./ShowCalendarsButton.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import Checkbox from "../Shared/Checkbox.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import { t } from "../../l10n/l10n";

  let calendars = appGlobal.calendars;
</script>

<style>
  .calendar-list {
    width: 15em;
    border-inline-end: 1px solid var(--border);
  }
  .header {
    height: 60px;
    min-height: 60px;
    align-items: center;
    /* Keeps the button where it is in the title bar: `.main` and `.title-bar` margins */
    padding-inline-start: 20px;
  }
  .calendars {
    overflow-y: auto;
  }
  .calendar {
    align-items: center;
    padding: 4px 8px;
  }
  .calendar :global(button:not(:hover)) {
    background-color: var(--calendar-color);
    color: lch(from var(--calendar-color) calc((49.44 - l) * infinity) 0 0);
  }
  .name {
    align-items: center;
    margin: 0px 8px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
