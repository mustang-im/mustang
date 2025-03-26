<hbox class="time">
  <hbox class="starttime">
    {getDateString($event.startTime)}
  </hbox>
  {#if $event.endTime}
    <hbox class="duration-prefix">
      {$t`for *=> as prefix for a time duration, e.g. 'at 5 PM for 30 minutes'`}
    </hbox>
    <hbox class="duration">
      {getDurationString($event.endTime.getTime() - $event.startTime.getTime())}
    </hbox>
  {/if}
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { getDateString, getDurationString } from "../../Util/date";
  import { t } from "../../../l10n/l10n";

  export let event: Event;
</script>

<style>
  .time {
    flex-wrap: wrap;
    font-size: 16px;
  }
  .starttime {
    font-weight: bold;
  }
  .duration-prefix {
    margin-inline-start: 16px;
    margin-inline-end: 0.3em;
  }
  .duration, .duration-prefix {
    opacity: 80%;
  }
</style>
