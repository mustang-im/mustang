<vbox class="event" flex
  on:click={() => catchErrors(onOpen)}>
  <div class="title">
    {event.title}
  </div>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { openEventFromOtherApp } from "../../Calendar/open";
  import { catchErrors } from "../../Util/error";

  export let event: Event;

  function onOpen() {
    openEventFromOtherApp(event);
  }
</script>

<style>
  .title {
    font-weight: bold;
  }
</style>
