<vbox class="app">
  <TitleBar bind:dateRange bind:dateInterval on:addEvent={addEvent} />
  <Stack>
    <hbox>dhdhd</hbox>
    <hbox>uzrztz</hbox>
  </Stack>
</vbox>

<script lang="ts">
  import TitleBar from "./TitleBar.svelte";
  import Stack from "../Shared/Stack.svelte";
  
  export let dateRange = new Date();
  export let dateInterval: 1 | 7 | 31 | 28 = 7;

  function addEvent() {
    alert("add event");
  }
</script>

<style>
  .app {
    flex: 1 0 0;
  }
</style>
