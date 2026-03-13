<hbox class="time label">
  {time.toLocaleTimeString(getDateTimeFormatPref(), { hour: "numeric" })}
</hbox>

<script lang="ts">
  import { getDateTimeFormatPref } from "../../../l10n/l10n";

  export let time: Date
</script>

<style>
  .time {
    margin: -0.8em 8px 0 0;
    color: #AAABB4;
    font-weight: 300;
    justify-content: end;
  }
</style>
