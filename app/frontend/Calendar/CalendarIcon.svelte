<Icon data={calendar} {size}>
  <text text-anchor="middle" x="65" y="95" class="date-calendar-icon">
    {day}
  </text>
</Icon>

<script lang="ts">
  import Icon from '../Shared/Icon.svelte';
  import calendar from '../asset/icon/appBar/calendar.svg?raw';
  import { onMount } from 'svelte';

  export let size: string = "24px";

  let day = new Date().getDate();

  onMount(setupNextUpdate);
  function setupNextUpdate() {
    let now = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);
    tomorrow.setMilliseconds(0);
    let nextUpdate = tomorrow.getTime() - now.getTime();
    setTimeout(() => {
      day = new Date().getDate();
      setupNextUpdate();
    }, nextUpdate);
  }
</script>

<style>
  .date-calendar-icon {
    font: bold 48px sans-serif;
    fill: white;
  }
</style>
