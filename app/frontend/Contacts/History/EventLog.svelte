<Clickable onClick={onOpen}>
  <vbox class="event" flex>
    <div class="title">
      {event.title}
    </div>
  </vbox>
</Clickable>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { openEvent } from "../../Calendar/open";
  import Clickable from "../../Shared/Clickable.svelte";
  import { AppWindow } from "../../MainWindow/AppWindow";

  const appWindow = AppWindow.current();

  export let event: Event;

  function onOpen() {
    openEvent(event, appWindow, false);
  }
</script>

<style>
  .title {
    font-weight: bold;
  }
</style>
