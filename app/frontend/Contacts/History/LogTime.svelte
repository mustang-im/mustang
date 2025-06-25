<hbox class="time font-smallest">
  {getDateTimeString(time)}
</hbox>

<script lang="ts">
  import type { LogEntry } from "../../../logic/Contacts/History/History";
  import { getDateTimeString } from "../../Util/date";

  export let message: LogEntry;

  $: time = (message as any).time; // set in `searchLog()` `.sortBy()`
</script>

<style>
  .time {
    min-width: 48px;
    max-width: 48px;
    max-height: 48px;
    overflow: hidden;
    border-top: 1px solid var(--border);
    padding: 4px;
  }
</style>
