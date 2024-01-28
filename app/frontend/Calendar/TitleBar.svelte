<hbox class="title-bar">
  <RoundButton classes="add-button" icon={AddToCalendarIcon} on:click={addEvent} iconSize="24px" filled />
  <hbox class="spacer" />
  <ViewSelector bind:dateInterval />
</hbox>

<script lang="ts">
  import type { DateInterval } from "./selected";
  import ViewSelector from "./ViewSelector.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import AddToCalendarIcon from "lucide-svelte/icons/calendar-plus";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let dateInterval: DateInterval = 7; /* in/out */

  function addEvent() {
    dispatch('addEvent');
  }
</script>

<style>
  .title-bar {
    align-items: baseline;
    margin: 16px 32px;
  }
  .title-bar :global(.add-button) {
    margin: 4px;
    width: 48px;
    height: 48px;
    align-items: center;
    justify-content: center;
    position: relative;
  }
</style>
