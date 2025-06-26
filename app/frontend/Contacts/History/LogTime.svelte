<hbox class="time font-smallest" flex>
  {getDateTimeString(time)}
</hbox>

<script lang="ts">
  import type { LogEntry } from "../../../logic/Contacts/History/History";
  import { getDateTimeString } from "../../Util/date";

  export let message: LogEntry;

  $: time = (message as any)._history_time; // set in `searchLog()` `.sortBy()`
</script>

<style>
  .time {
    overflow: hidden;
    border-top: 1px solid var(--border);
    padding: 4px;
  }
</style>
