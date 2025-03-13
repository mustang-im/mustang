<vbox class="invitation-display">
  <hbox class="title-row">
    <hbox class="title selectable">
      {#if event.title}
        {event.title}
      {/if}
    </hbox>
    <hbox flex />
  </hbox>
  <vbox class="details-grid">
    <DetailsGrid {event} />
  </vbox>
</vbox>

<script lang="ts">
  import { Event } from "../../../logic/Calendar/Event";
  import DetailsGrid from "./DetailsGrid.svelte";

  export let event: Event;
</script>

<style>
  .title {
    font-size: 20px;
    font-weight: bold;
  }
  .details-grid {
    margin: 20px 16px;
  }
</style>
