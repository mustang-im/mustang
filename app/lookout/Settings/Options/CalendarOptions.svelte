<OptionsPage icon={CalendarIcon} description={$t`Change the settings for calendars, meetings, and time zones.`}>
  <OptionsSection title={$t`Calendar options`}>
    <OptionsRow icon={DurationIcon}>
      <hbox class="field-row">
        <label for="options-event-duration">{$t`Default duration for new appointments and meetings:`}</label>
        <select id="options-event-duration" class="lo-text-field duration" bind:value={options.defaultEventDuration.value}>
          {#each durations as minutes}
            <option value={minutes}>{durationLabel(minutes)}</option>
          {/each}
        </select>
      </hbox>
    </OptionsRow>
  </OptionsSection>

  <OptionsSection title={$t`Display options`}>
    <OptionsRow icon={DisplayIcon}>
      <label>
        <input type="checkbox" bind:checked={options.weekNumbers.value} />
        {$t`Show week numbers in the Month View and in the Date Navigator`}
      </label>
      <label>
        <input type="checkbox" bind:checked={options.showDeclined.value} />
        {$t`Show declined meetings`}
      </label>
    </OptionsRow>
  </OptionsSection>
</OptionsPage>

<script lang="ts">
  import type { OptionsModel } from "./OptionsModel";
  import OptionsPage from "./OptionsPage.svelte";
  import OptionsSection from "./OptionsSection.svelte";
  import OptionsRow from "./OptionsRow.svelte";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import DurationIcon from "lucide-svelte/icons/calendar-clock";
  import DisplayIcon from "lucide-svelte/icons/calendar-days";
  import { gt, t } from "../../../l10n/l10n";

  export let options: OptionsModel;

  const kStandardDurations = [ 15, 30, 45, 60, 90, 120 ];
  $: durations = kStandardDurations.includes(options.defaultEventDuration.value)
    ? kStandardDurations
    : [ ...kStandardDurations, options.defaultEventDuration.value ].sort((a, b) => a - b);

  function durationLabel(minutes: number): string {
    if (minutes < 60 || minutes % 30) {
      return gt`${minutes} minutes`;
    }
    return minutes == 60 ? gt`1 hour` : gt`${minutes / 60} hours`;
  }
</script>

<style>
  select.duration {
    min-width: 140px;
  }
</style>
