<hbox class="calendar-selector">
  <NativeSelect
      data={calendarOptions}
      bind:value={calendar}
  />
</hbox>

<script lang="ts">
  import type { Calendar } from "../../logic/Calendar/Calendar";
  import { appGlobal } from "../../logic/app";
  import { NativeSelect } from '@svelteuidev/core';

  export let calendar: Calendar; /* in/out */

  const calendarOptions = appGlobal.calendars.contents.map(calendar => ({
    value: calendar.id,
    label: calendar.name,
  }));
</script>

<style>
  .calendar-selector :global(select) {
    border: none;
  }
</style>
