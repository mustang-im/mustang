<hbox class="title-bar">
  <CalendarSelector calendar={$selectedCalendar}/>
  <RoundButton classes="add-button create" label="New event" icon={AddToCalendarIcon} on:click={addEvent} iconSize="20px" padding="10px" />
  <hbox class="spacer" />
  <ViewSelector bind:dateInterval />
</hbox>

<script lang="ts">
  import { selectedCalendar, type DateInterval } from "./selected";
  import ViewSelector from "./ViewSelector.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import AddToCalendarIcon from "lucide-svelte/icons/calendar-plus";
  import { createEventDispatcher } from 'svelte';
  import CalendarSelector from "./CalendarSelector.svelte";
  const dispatch = createEventDispatcher();

  export let dateInterval: DateInterval = 7; /* in/out */

  function addEvent() {
    dispatch('addEvent');
  }
</script>

<style>
  .title-bar {
    align-items: center;
    margin: 16px 32px 0px 32px;
  }
  .title-bar :global(.calendar-selector) {
    margin-right: 16px;
  }
  .title-bar :global(.add-button) {
    margin: 4px;
    align-items: center;
    justify-content: center;
    position: relative;
  }
</style>
