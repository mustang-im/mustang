<Icon data={calendar} {size}>
  <text text-anchor="middle" x="65" y="95" class="date-calendar-icon">
    {day}
  </text>
</Icon>

<script lang="ts">
import Icon from '../Shared/Icon.svelte';
import calendar from '../asset/icon/appBar/calendar.svg?raw';

export let size: string = "24px";

let day = new Date().getDate();
</script>

<style>
  .date-calendar-icon {
    font: bold 48px sans-serif;
    fill: white;
  }
</style>
