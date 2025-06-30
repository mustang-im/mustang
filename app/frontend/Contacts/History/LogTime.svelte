<vbox class="time-box font-smallest" flex
  title={time.toLocaleDateString(getUILocale()) + "\n" + time.toLocaleTimeString(getUILocale())}>
  {#if !sameDay}
    <hbox class="date">
      {getDateString(time)}
    </hbox>
  {/if}
  <hbox class="time">
    {getTimeString(time)}
  </hbox>
</vbox>

<script lang="ts">
  import type { LogEntry } from "../../../logic/Contacts/History/History";
  import { getDateString, getTimeString } from "../../Util/date";
  import { getUILocale } from "../../../l10n/l10n";

  export let message: LogEntry;
  export let previousMessage: LogEntry | null;

  $: time = (message as any)._history_time as Date; // set in `searchLog()` `.sortBy()`
  $: sameDay = time.toLocaleDateString() == (previousMessage as any)?._history_time.toLocaleDateString();
</script>

<style>
  .time-box {
    max-height: 40px;
    overflow: hidden;
    padding: 6px 4px 4px 0px;
  }
  :global(.row:not(.selected)) .time-box {
    border-top: 1px solid var(--border);
  }
  .date {
    background-color: var(--headerbar-bg);
    color: var(--headerbar-fg);
    border-radius: 30px;
    font-weight: bold;
    align-self: start;
    padding-inline-start: 6px;
    padding-inline-end: 6px;
    margin-block-end: 2px;
    max-height: 18px;
    overflow: hidden;
  }
  .time {
    padding-inline-start: 6px;
    max-height: 18px;
    overflow: hidden;
  }
</style>
