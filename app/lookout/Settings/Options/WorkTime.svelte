<OptionsSection title={$t`Work time`}>
  <OptionsRow icon={WorkTimeIcon}>
    <grid class="work-time">
      {#if !isCalendarFixed && $calendars.length > 1}
        <span class="first">{$t`Calendar:`}</span>
        <hbox class="wide">
          <ComboBox options={$calendars.contents.map(entry => ({ value: entry, label: entry.name }))}
            bind:value={calendar} label={$t`Calendar`} width="280px" />
        </hbox>
      {/if}
      {#if calendar && workHours}
        <span class="all">{$t`Work hours:`}</span>
        {#each weekdays as weekday (weekday.weekday)}
          <WorkDayRow day={workHours.days[weekday.weekday]} name={weekday.name} {times} disabled={readOnly} />
        {/each}
        <span class="first" class:disabled={readOnly}>{$t`Time zone:`}</span>
        <hbox class="wide">
          <ComboBox options={zoneChoices} value={$workHours.timezone ?? ""} label={$t`Time zone of the work hours`}
            width="100%" disabled={readOnly}
            onChange={zone => { workHours.timezone = zone || null; }} />
        </hbox>
      {/if}
    </grid>
    {#if calendar}
      <span class="note">
        {#if readOnly && workHours}
          {$t`These are the work hours of ${$calendar.name}, as the server tells them.`}
        {:else if readOnly || !workHours}
          {$t`The server does not tell the work hours of ${$calendar.name}.`}
        {:else if $calendar.canSaveWorkHoursPerDayOnServer}
          {$t`The work hours are saved on the server.`}
        {:else if $calendar.canSaveWorkHoursOnServer}
          {$t`The server saves one time range for all work days. The times of each day are saved on this computer.`}
        {:else}
          {$t`The work hours are saved only on this computer, because the server cannot store them.`}
        {/if}
      </span>
    {/if}
  </OptionsRow>
</OptionsSection>

<script lang="ts">
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import type { WorkHoursDrafts } from "./WorkHoursDrafts";
  import { WorkTimeOptions } from "./WorkTimeOptions";
  import { TimeZoneChoice, ZoneClock } from "../../Calendar/View/TimeZones";
  import { appGlobal } from "../../../logic/app";
  import { selectedCalendar } from "../../../frontend/Calendar/selected";
  import OptionsSection from "./OptionsSection.svelte";
  import OptionsRow from "./OptionsRow.svelte";
  import WorkDayRow from "./WorkDayRow.svelte";
  import ComboBox from "../../Shared/Form/ComboBox.svelte";
  import WorkTimeIcon from "lucide-svelte/icons/briefcase-business";
  import { t } from "../../../l10n/l10n";

  export let drafts: WorkHoursDrafts;
  export let calendar: Calendar = $selectedCalendar ?? appGlobal.calendars.first;
  export let isCalendarFixed = false;

  const calendars = appGlobal.calendars;
  const times = new WorkTimeOptions();
  const weekdays = WorkTimeOptions.weekdays();

  $: workHours = calendar && $calendar ? drafts.draftOf($calendar) : null;
  $: readOnly = !!calendar && $calendar.isOtherPersonsCalendar;
  $: zoneChoices = [
    { value: "", label: $t`Time zone of this computer (${ZoneClock.systemZone})` },
    ...TimeZoneChoice.all(undefined, [ workHours?.timezone ]).map(choice => ({ value: choice.zone, label: choice.label })),
  ];
</script>

<style>
  .work-time {
    grid-template-columns: 184px max-content max-content max-content minmax(0, 1fr);
    align-items: center;
    gap: 6px 10px;
  }
  .work-time > :global(.lo-checkbox) {
    grid-column: 1;
    padding-inline-start: 24px;
  }
  .first {
    grid-column: 1;
  }
  .wide {
    grid-column: 2 / -1;
    max-width: 420px;
  }
  .all {
    grid-column: 1 / -1;
  }
  .note {
    margin-block-start: 4px;
    color: var(--lo-fg-secondary);
  }
  .disabled {
    color: var(--lo-fg-disabled);
  }
</style>
